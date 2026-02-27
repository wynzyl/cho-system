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

  // Verify diagnosis exists and belongs to an encounter assigned to this doctor
  const diagnosis = await db.diagnosis.findFirst({
    where: {
      id: data.diagnosisId,
      deletedAt: null,
      encounter: {
        facilityId: session.facilityId,
        status: "IN_CONSULT",
        doctorId: session.userId,
        deletedAt: null,
      },
    },
  })

  if (!diagnosis) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Diagnosis not found or not editable",
      },
    }
  }

  // Soft delete the diagnosis
  await db.diagnosis.update({
    where: { id: data.diagnosisId },
    data: {
      deletedAt: new Date(),
      deletedById: session.userId,
    },
  })

  return {
    ok: true,
    data: {
      diagnosisId: data.diagnosisId,
    },
  }
}
