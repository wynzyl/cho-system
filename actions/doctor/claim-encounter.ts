"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { claimEncounterSchema, type ClaimEncounterInput } from "@/lib/validators/doctor"
import type { ActionResult } from "@/lib/auth/types"

export async function claimEncounterAction(
  input: ClaimEncounterInput
): Promise<ActionResult<{ encounterId: string }>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const parsed = claimEncounterSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0])
      if (!fieldErrors[field]) {
        fieldErrors[field] = []
      }
      fieldErrors[field].push(issue.message)
    }
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        fieldErrors,
      },
    }
  }

  const { encounterId } = parsed.data

  // Verify encounter exists, is TRIAGED, unclaimed, and at user's facility
  const encounter = await db.encounter.findFirst({
    where: {
      id: encounterId,
      status: "TRIAGED",
      doctorId: null,
      facilityId: session.facilityId,
      deletedAt: null,
    },
    include: {
      patient: {
        select: {
          patientCode: true,
        },
      },
    },
  })

  if (!encounter) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Encounter not found, already claimed, or not in TRIAGED status",
      },
    }
  }

  await db.$transaction(async (tx) => {
    // Claim the encounter
    await tx.encounter.update({
      where: { id: encounterId },
      data: {
        doctorId: session.userId,
        status: "WAIT_DOCTOR",
      },
    })

    // Create audit log
    await tx.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: "UPDATE",
        entity: "Encounter",
        entityId: encounterId,
        metadata: {
          action: "ENCOUNTER_CLAIMED",
          patientCode: encounter.patient.patientCode,
          previousStatus: "TRIAGED",
          newStatus: "WAIT_DOCTOR",
        },
      },
    })
  })

  return {
    ok: true,
    data: { encounterId },
  }
}
