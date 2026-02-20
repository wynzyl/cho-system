"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { createEncounterSchema, type CreateEncounterInput } from "@/lib/validators/encounter"
import type { ActionResult } from "@/lib/auth/types"
import { Encounter } from "@prisma/client"

export async function createEncounterAction(
  input: CreateEncounterInput
): Promise<ActionResult<Encounter>> {
  const session = await requireRoleForAction(["REGISTRATION"])

  const parsed = createEncounterSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
      },
    }
  }

  const { patientId } = parsed.data

  const patient = await db.patient.findFirst({
    where: { id: patientId, deletedAt: null },
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

  // Check for existing encounter today (one encounter per patient per day)
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const existingEncounter = await db.encounter.findFirst({
    where: {
      patientId,
      facilityId: session.facilityId,
      occurredAt: { gte: startOfDay, lte: endOfDay },
      deletedAt: null,
    },
  })

  if (existingEncounter) {
    return {
      ok: false,
      error: {
        code: "ENCOUNTER_EXISTS",
        message: "Patient already has an encounter today",
      },
    }
  }

  const encounter = await db.$transaction(async (tx) => {
    const newEncounter = await tx.encounter.create({
      data: {
        patientId,
        facilityId: session.facilityId,
        status: "WAIT_TRIAGE",
        occurredAt: new Date(),
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

    return newEncounter
  })

  return {
    ok: true,
    data: encounter,
  }
}
