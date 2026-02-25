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

  // Verify patient exists and is not deleted
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

  // Check for existing encounter today (not cancelled, not deleted)
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const existingEncounter = await db.encounter.findFirst({
    where: {
      patientId,
      facilityId: session.facilityId,
      deletedAt: null,
      status: { not: "CANCELLED" },
      occurredAt: { gte: startOfDay, lte: endOfDay },
    },
    select: { id: true, status: true },
  })

  if (existingEncounter) {
    return {
      ok: false,
      error: {
        code: "DUPLICATE_ENCOUNTER",
        message: "Patient already has an active encounter today",
      },
    }
  }

  // Create encounter
  const encounter = await db.$transaction(async (tx) => {
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

    return newEncounter
  })

  return {
    ok: true,
    data: { encounterId: encounter.id },
  }
}
