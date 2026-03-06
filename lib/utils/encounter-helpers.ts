/**
 * Encounter helper utilities for managing encounter lifecycle
 * Centralizes logic for stale encounter cancellation and recycling
 */

import type { SessionUser } from "@/lib/auth/types"
import type { Prisma, EncounterStatus } from "@prisma/client"
import { getTodayAndTomorrow } from "./date"

/**
 * Type for Prisma transaction client
 */
type TransactionClient = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

/**
 * Statuses that are considered stale and should be auto-cancelled
 * when the patient returns on a new day
 *
 * Excluded:
 * - FOR_LAB/FOR_PHARMACY: Patient may return with results (transitions to WAIT_DOCTOR)
 * - DONE/CANCELLED: Already terminal states
 */
export const STALE_ENCOUNTER_STATUSES: EncounterStatus[] = [
  "WAIT_TRIAGE",
  "TRIAGED",
  "WAIT_DOCTOR",
  "IN_CONSULT",
]

/**
 * Cancellation reasons for audit trail
 */
export const CANCELLATION_REASONS = {
  SYSTEM_AUTO_STALE: "SYSTEM_AUTO_STALE", // Auto-cancelled due to being from a previous day
  USER_CANCELLED: "USER_CANCELLED", // Manually cancelled by a user
} as const

export type CancellationReason = keyof typeof CANCELLATION_REASONS

/**
 * Result of stale encounter cancellation
 */
export interface CancelStaleEncountersResult {
  cancelledIds: string[]
  cancelledCount: number
}

/**
 * Cancels stale incomplete encounters from previous days for a patient
 *
 * This function finds encounters that:
 * 1. Belong to the specified patient
 * 2. Have occurredAt before the start of today
 * 3. Are in a stale status (WAIT_TRIAGE, TRIAGED, WAIT_DOCTOR, IN_CONSULT)
 * 4. Are not soft-deleted
 *
 * Each cancelled encounter gets:
 * - status set to CANCELLED
 * - cancelledAt timestamp
 * - cancelledById user reference
 * - cancellationReason set to SYSTEM_AUTO_STALE
 * - An audit log entry
 *
 * @param tx - Prisma transaction client
 * @param patientId - The patient whose stale encounters to cancel
 * @param session - Current user session (for audit)
 * @param facilityId - Optional: if provided, only cancel encounters at this facility
 * @returns Object with cancelled encounter IDs and count
 */
export async function cancelStaleEncountersForPatient(
  tx: TransactionClient,
  patientId: string,
  session: SessionUser,
  facilityId?: string
): Promise<CancelStaleEncountersResult> {
  const { today } = getTodayAndTomorrow()
  const now = new Date()

  // Build where clause
  const whereClause: Prisma.EncounterWhereInput = {
    patientId,
    deletedAt: null,
    occurredAt: { lt: today }, // Before start of today
    status: { in: STALE_ENCOUNTER_STATUSES },
  }

  // Optionally scope to facility
  if (facilityId) {
    whereClause.facilityId = facilityId
  }

  // Find stale encounters
  const staleEncounters = await tx.encounter.findMany({
    where: whereClause,
    select: {
      id: true,
      status: true,
      occurredAt: true,
      facilityId: true,
      patient: {
        select: { patientCode: true },
      },
    },
    orderBy: { occurredAt: "asc" },
  })

  if (staleEncounters.length === 0) {
    return { cancelledIds: [], cancelledCount: 0 }
  }

  const cancelledIds: string[] = []

  // Cancel each stale encounter
  for (const encounter of staleEncounters) {
    await tx.encounter.update({
      where: { id: encounter.id },
      data: {
        status: "CANCELLED",
        cancelledAt: now,
        cancelledById: session.userId,
        cancellationReason: CANCELLATION_REASONS.SYSTEM_AUTO_STALE,
      },
    })

    // Create audit log
    await tx.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: "UPDATE",
        entity: "Encounter",
        entityId: encounter.id,
        metadata: {
          action: "SYSTEM_AUTO_CANCEL",
          previousStatus: encounter.status,
          newStatus: "CANCELLED",
          reason: CANCELLATION_REASONS.SYSTEM_AUTO_STALE,
          patientCode: encounter.patient.patientCode,
          staleDate: encounter.occurredAt.toISOString().split("T")[0],
          facilityId: encounter.facilityId,
          triggeredBy: "new_encounter_creation",
        },
      },
    })

    cancelledIds.push(encounter.id)
  }

  return {
    cancelledIds,
    cancelledCount: cancelledIds.length,
  }
}

/**
 * Checks if an encounter is stale (from a previous day and in an incomplete status)
 *
 * @param occurredAt - When the encounter occurred
 * @param status - Current encounter status
 * @returns true if the encounter is considered stale
 */
export function isEncounterStale(occurredAt: Date, status: EncounterStatus): boolean {
  const { today } = getTodayAndTomorrow()
  const isFromPreviousDay = occurredAt < today
  const isStaleStatus = STALE_ENCOUNTER_STATUSES.includes(status)
  return isFromPreviousDay && isStaleStatus
}
