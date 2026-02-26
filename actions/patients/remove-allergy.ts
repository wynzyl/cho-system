"use server"

import { db } from "@/lib/db"
import { logAudit } from "@/lib/db/audit"
import { requireRoleForAction } from "@/lib/auth/guards"
import { removeAllergySchema, type RemoveAllergyInput } from "@/lib/validators/patient"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"

export async function removeAllergyAction(
  input: RemoveAllergyInput
): Promise<ActionResult<{ success: true }>> {
  const session = await requireRoleForAction(["REGISTRATION", "TRIAGE", "DOCTOR", "ADMIN"])

  const validation = validateInput(removeAllergySchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  // Verify allergy exists
  const existingAllergy = await db.patientAllergy.findFirst({
    where: { id: data.allergyId, deletedAt: null },
  })

  if (!existingAllergy) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Allergy record not found",
      },
    }
  }

  await db.$transaction(async (tx) => {
    // Soft delete the allergy
    await tx.patientAllergy.update({
      where: { id: data.allergyId },
      data: {
        deletedAt: new Date(),
        deletedById: session.userId,
      },
    })

    // Check if patient has any remaining active allergies
    const remainingAllergies = await tx.patientAllergy.count({
      where: {
        patientId: existingAllergy.patientId,
        deletedAt: null,
        status: "ACTIVE",
      },
    })

    // If no active allergies remain, update patient status to NKA
    if (remainingAllergies === 0) {
      await tx.patient.update({
        where: { id: existingAllergy.patientId },
        data: {
          allergyStatus: "NKA",
          allergyConfirmedAt: new Date(),
          allergyConfirmedById: session.userId,
        },
      })
    }

    // Create audit log
    await logAudit(tx, {
      userId: session.userId,
      userName: session.name,
      action: "DELETE_SOFT",
      entity: "PatientAllergy",
      entityId: data.allergyId,
      metadata: {
        patientId: existingAllergy.patientId,
        allergen: existingAllergy.allergen,
      },
    })
  })

  return {
    ok: true,
    data: { success: true },
  }
}
