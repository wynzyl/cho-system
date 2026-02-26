"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { updateAllergySchema, type UpdateAllergyInput } from "@/lib/validators/patient"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"
import { PatientAllergy } from "@prisma/client"

export async function updateAllergyAction(
  input: UpdateAllergyInput
): Promise<ActionResult<PatientAllergy>> {
  const session = await requireRoleForAction(["REGISTRATION", "TRIAGE", "DOCTOR"])

  const validation = validateInput(updateAllergySchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  // Verify allergy exists
  const existingAllergy = await db.patientAllergy.findFirst({
    where: { id: data.allergyId, deletedAt: null },
    include: { patient: true },
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

  const allergy = await db.$transaction(async (tx) => {
    const updatedAllergy = await tx.patientAllergy.update({
      where: { id: data.allergyId },
      data: {
        ...(data.allergen !== undefined && { allergen: data.allergen.trim() }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.severity !== undefined && { severity: data.severity }),
        ...(data.reaction !== undefined && { reaction: data.reaction || null }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
      },
    })

    // Create audit log
    await tx.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: "UPDATE",
        entity: "PatientAllergy",
        entityId: data.allergyId,
        metadata: {
          patientId: existingAllergy.patientId,
          changes: data,
        },
      },
    })

    return updatedAllergy
  })

  return {
    ok: true,
    data: allergy,
  }
}
