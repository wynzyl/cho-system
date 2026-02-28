"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { completeConsultationSchema, type CompleteConsultationInput } from "@/lib/validators/doctor"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"

export async function completeConsultationAction(
  input: CompleteConsultationInput
): Promise<ActionResult<{ encounterId: string; status: string }>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const validation = validateInput(completeConsultationSchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  // Verify encounter exists and is in IN_CONSULT status with this doctor
  const encounter = await db.encounter.findFirst({
    where: {
      id: data.encounterId,
      facilityId: session.facilityId,
      status: "IN_CONSULT",
      doctorId: session.userId,
      deletedAt: null,
    },
    include: {
      patient: {
        select: {
          patientCode: true,
        },
      },
      diagnoses: {
        where: { deletedAt: null },
      },
    },
  })

  if (!encounter) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Encounter not found or you are not the assigned doctor",
      },
    }
  }

  // Require at least one diagnosis to complete
  if (encounter.diagnoses.length === 0) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "At least one diagnosis is required to complete consultation",
      },
    }
  }

  await db.$transaction(async (tx) => {
    // Update encounter status
    await tx.encounter.update({
      where: { id: data.encounterId },
      data: {
        status: data.nextStatus,
        consultEndedAt: new Date(),
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
          action: "CONSULTATION_COMPLETED",
          patientCode: encounter.patient.patientCode,
          previousStatus: "IN_CONSULT",
          newStatus: data.nextStatus,
          diagnosisCount: encounter.diagnoses.length,
        },
      },
    })
  })

  return {
    ok: true,
    data: {
      encounterId: data.encounterId,
      status: data.nextStatus,
    },
  }
}
