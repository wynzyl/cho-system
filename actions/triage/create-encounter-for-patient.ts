"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import type { ActionResult } from "@/lib/auth/types"
import { z } from "zod"

const inputSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
})

type CreateEncounterInput = z.infer<typeof inputSchema>

export type CreateEncounterResponse = {
  encounterId: string
  reused: boolean
}

export async function createEncounterForPatientAction(
  input: CreateEncounterInput
): Promise<ActionResult<CreateEncounterResponse>> {
  const session = await requireRoleForAction(["TRIAGE"])

  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid patient ID",
      },
    }
  }

  const { patientId } = parsed.data

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

  // RULES BEFORE ENCOUNTER (see Project_roadmap.md):
  // 1. Do not allow a new WAIT_TRIAGE encounter if one already exists.
  // 2. If a previous WAIT_TRIAGE encounter exists, reuse it and reschedule to now.
  // 3. If a previous FOR_LAB encounter exists, mark as TRIAGED (follow-up visit).
  try {
    const result = await db.$transaction(async (tx) => {
      const existingWaitTriage = await tx.encounter.findFirst({
        where: {
          patientId,
          status: "WAIT_TRIAGE",
          deletedAt: null,
        },
        select: { id: true, occurredAt: true },
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

        await tx.auditLog.create({
          data: {
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
          },
        })

        return { encounterId: updated.id, reused: true }
      }

      // Check for FOR_LAB encounter - follow-up visit skips triage vitals
      const existingForLab = await tx.encounter.findFirst({
        where: {
          patientId,
          status: "FOR_LAB",
          deletedAt: null,
        },
        select: { id: true },
        orderBy: { occurredAt: "desc" },
      })

      if (existingForLab) {
        const updated = await tx.encounter.update({
          where: { id: existingForLab.id },
          data: {
            status: "TRIAGED",
          },
        })

        await tx.auditLog.create({
          data: {
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
          },
        })

        return { encounterId: updated.id, reused: true }
      }

      // Check for any existing active encounter (regardless of date)
      // WAIT_TRIAGE and FOR_LAB are excluded since they're handled above
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

      const newEncounter = await tx.encounter.create({
        data: {
          patientId,
          facilityId: session.facilityId,
          status: "WAIT_TRIAGE",
        },
      })

      await tx.auditLog.create({
        data: {
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
        },
      })

      return { encounterId: newEncounter.id, reused: false }
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

    // Handle unique constraint violation (race condition - another request created WAIT_TRIAGE first)
    // Prisma P2002 = Unique constraint failed
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      // Retry by finding and reusing the existing WAIT_TRIAGE encounter
      const existingWaitTriage = await db.encounter.findFirst({
        where: {
          patientId,
          status: "WAIT_TRIAGE",
          deletedAt: null,
        },
        select: { id: true },
      })

      if (existingWaitTriage) {
        return {
          ok: true,
          data: { encounterId: existingWaitTriage.id, reused: true },
        }
      }
    }

    throw error
  }
}
