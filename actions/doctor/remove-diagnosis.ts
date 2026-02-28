"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { removeDiagnosisSchema, type RemoveDiagnosisInput } from "@/lib/validators/doctor"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"

export async function removeDiagnosisAction(
  input: RemoveDiagnosisInput
): Promise<ActionResult<{ diagnosisId: string }>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const validation = validateInput(removeDiagnosisSchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  // Find the diagnosis and verify ownership
  const diagnosis = await db.diagnosis.findFirst({
    where: {
      id: data.diagnosisId,
      deletedAt: null,
    },
    include: {
      encounter: {
        select: {
          id: true,
          status: true,
          doctorId: true,
          facilityId: true,
          patient: {
            select: {
              patientCode: true,
            },
          },
        },
      },
    },
  })

  if (!diagnosis) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Diagnosis not found",
      },
    }
  }

  // Verify encounter is in IN_CONSULT and this doctor owns it
  if (
    diagnosis.encounter.status !== "IN_CONSULT" ||
    diagnosis.encounter.doctorId !== session.userId ||
    diagnosis.encounter.facilityId !== session.facilityId
  ) {
    return {
      ok: false,
      error: {
        code: "FORBIDDEN",
        message: "Cannot remove diagnosis from this encounter",
      },
    }
  }

  await db.$transaction(async (tx) => {
    // Soft delete the diagnosis
    await tx.diagnosis.update({
      where: { id: data.diagnosisId },
      data: {
        deletedAt: new Date(),
        deletedById: session.userId,
      },
    })

    // Create audit log
    await tx.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: "DELETE_SOFT",
        entity: "Diagnosis",
        entityId: data.diagnosisId,
        metadata: {
          patientCode: diagnosis.encounter.patient.patientCode,
          encounterId: diagnosis.encounter.id,
          diagnosisText: diagnosis.text,
        },
      },
    })
  })

  return {
    ok: true,
    data: { diagnosisId: data.diagnosisId },
  }
}
