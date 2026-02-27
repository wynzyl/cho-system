"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { startConsultationSchema } from "@/lib/validators/doctor"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"

export async function startConsultationAction(input: {
  encounterId: string
}): Promise<ActionResult<{ encounterId: string }>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const validation = validateInput(startConsultationSchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  // Verify encounter exists and is in TRIAGED status
  const encounter = await db.encounter.findFirst({
    where: {
      id: data.encounterId,
      facilityId: session.facilityId,
      status: "TRIAGED",
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
        message: "Encounter not found or not ready for consultation",
      },
    }
  }

  await db.$transaction(async (tx) => {
    // Update encounter to IN_CONSULT and assign doctor
    await tx.encounter.update({
      where: { id: data.encounterId },
      data: {
        status: "IN_CONSULT",
        doctorId: session.userId,
        consultStartedAt: new Date(),
      },
    })

    // Create audit log
    await tx.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: "UPDATE",
        entity: "Encounter",
        entityId: data.encounterId,
        metadata: {
          action: "CONSULTATION_STARTED",
          patientCode: encounter.patient.patientCode,
          previousStatus: "TRIAGED",
          newStatus: "IN_CONSULT",
        },
      },
    })
  })

  return {
    ok: true,
    data: { encounterId: data.encounterId },
  }
}
