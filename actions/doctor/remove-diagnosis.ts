"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { removeDiagnosisSchema, type RemoveDiagnosisInput } from "@/lib/validators/doctor"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"
import { notFoundError, forbiddenError, createAuditLog } from "@/lib/utils/action-helpers"

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
    return notFoundError("Diagnosis")
  }

  // Verify encounter is in IN_CONSULT and this doctor owns it (ADMIN can bypass)
  const isAdmin = session.role === "ADMIN"
  const isAssignedDoctor = diagnosis.encounter.doctorId === session.userId
  if (
    diagnosis.encounter.status !== "IN_CONSULT" ||
    diagnosis.encounter.facilityId !== session.facilityId ||
    (!isAdmin && !isAssignedDoctor)
  ) {
    return forbiddenError("Cannot remove diagnosis from this encounter")
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
    await createAuditLog(tx, session, "DELETE_SOFT", "Diagnosis", data.diagnosisId, {
      patientCode: diagnosis.encounter.patient.patientCode,
      encounterId: diagnosis.encounter.id,
      diagnosisText: diagnosis.text,
    })
  })

  return {
    ok: true,
    data: { diagnosisId: data.diagnosisId },
  }
}
