"use server"

import { db } from "@/lib/db"
import { logAudit } from "@/lib/db/audit"
import { requireRoleForAction } from "@/lib/auth/guards"
import { createEncounterSchema, type CreateEncounterInput } from "@/lib/validators/encounter"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"
import { Encounter } from "@prisma/client"

export async function createEncounterAction(
  input: CreateEncounterInput
): Promise<ActionResult<Encounter>> {
  const session = await requireRoleForAction(["REGISTRATION"])

  const validation = validateInput(createEncounterSchema, input)
  if (!validation.ok) return validation.result
  const { patientId } = validation.data

  const patient = await db.patient.findFirst({
    where: { id: patientId, deletedAt: null },
    select: { id: true, patientCode: true },
  })

  if (!patient) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Patient not found",
      },
    }
  }

  // RULES:
  // 1. If WAIT_TRIAGE exists, reuse it (update occurredAt to now)
  // 2. If FOR_LAB exists, mark as TRIAGED (follow-up visit)
  // 3. If any other active encounter exists, block creation
  try {
    const result = await db.$transaction(async (tx) => {
      // Check for existing WAIT_TRIAGE - reuse it
      const existingWaitTriage = await tx.encounter.findFirst({
        where: {
          patientId,
          status: "WAIT_TRIAGE",
          deletedAt: null,
        },
        orderBy: { occurredAt: "desc" },
      })

      if (existingWaitTriage) {
        const previousOccurredAt = existingWaitTriage.occurredAt
        const now = new Date()

        const updated = await tx.encounter.update({
          where: { id: existingWaitTriage.id },
          data: {
            occurredAt: now,
            facilityId: session.facilityId,
          },
        })

        await logAudit(tx, {
          userId: session.userId,
          userName: session.name,
          action: "UPDATE",
          entity: "Encounter",
          entityId: updated.id,
          metadata: {
            patientId,
            patientCode: patient.patientCode,
            rule: "REUSE_WAIT_TRIAGE",
            previousOccurredAt: previousOccurredAt.toISOString(),
            newOccurredAt: now.toISOString(),
          },
        })

        return updated
      }

      // Check for FOR_LAB - mark as TRIAGED (follow-up visit)
      const existingForLab = await tx.encounter.findFirst({
        where: {
          patientId,
          status: "FOR_LAB",
          deletedAt: null,
        },
        orderBy: { occurredAt: "desc" },
      })

      if (existingForLab) {
        const updated = await tx.encounter.update({
          where: { id: existingForLab.id },
          data: {
            status: "TRIAGED",
          },
        })

        await logAudit(tx, {
          userId: session.userId,
          userName: session.name,
          action: "UPDATE",
          entity: "Encounter",
          entityId: updated.id,
          metadata: {
            patientId,
            patientCode: patient.patientCode,
            rule: "FOR_LAB_FOLLOWUP",
            previousStatus: "FOR_LAB",
            newStatus: "TRIAGED",
          },
        })

        return updated
      }

      // Check for any other active encounter (WAIT_TRIAGE and FOR_LAB handled above)
      const existingActive = await tx.encounter.findFirst({
        where: {
          patientId,
          deletedAt: null,
          status: { notIn: ["CANCELLED", "DONE", "WAIT_TRIAGE", "FOR_LAB"] },
        },
        select: { id: true, status: true },
      })

      if (existingActive) {
        throw new Error("ENCOUNTER_ALREADY_IN_PROGRESS")
      }

      // Create new encounter
      const newEncounter = await tx.encounter.create({
        data: {
          patientId,
          facilityId: session.facilityId,
          status: "WAIT_TRIAGE",
          occurredAt: new Date(),
        },
      })

      await logAudit(tx, {
        userId: session.userId,
        userName: session.name,
        action: "CREATE",
        entity: "Encounter",
        entityId: newEncounter.id,
        metadata: {
          patientId,
          patientCode: patient.patientCode,
          status: "WAIT_TRIAGE",
        },
      })

      return newEncounter
    })

    return { ok: true, data: result }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ENCOUNTER_ALREADY_IN_PROGRESS"
    ) {
      return {
        ok: false,
        error: {
          code: "ENCOUNTER_ALREADY_IN_PROGRESS",
          message:
            "Patient already has an active encounter. Complete or cancel it first.",
        },
      }
    }

    // Handle unique constraint violation (race condition)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      const existingWaitTriage = await db.encounter.findFirst({
        where: {
          patientId,
          status: "WAIT_TRIAGE",
          deletedAt: null,
        },
      })

      if (existingWaitTriage) {
        return { ok: true, data: existingWaitTriage }
      }
    }

    throw error
  }
}
