"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { EDIT_ALLERGIES_ROLES } from "@/lib/auth/permissions"
import { updateAllergySchema, type UpdateAllergyInput } from "@/lib/validators/patient"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"
import { PatientAllergy } from "@prisma/client"

export async function updateAllergyAction(
  input: UpdateAllergyInput
): Promise<ActionResult<PatientAllergy>> {
  const session = await requireRoleForAction(EDIT_ALLERGIES_ROLES)

  const validation = validateInput(updateAllergySchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  // Reject empty allergen after trim (whitespace-only input)
  if (data.allergen !== undefined && !data.allergen.trim()) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Allergen cannot be blank",
        fieldErrors: { allergen: ["Allergen is required"] },
      },
    }
  }

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
      where: { id: data.allergyId, deletedAt: null },
      data: {
        ...(data.allergen !== undefined && { allergen: data.allergen.trim() }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.severity !== undefined && { severity: data.severity }),
        ...(data.reaction !== undefined && { reaction: data.reaction || null }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
      },
    })

    // Sync patient allergyStatus when allergy status changes
    if (data.status !== undefined && data.status !== existingAllergy.status) {
      const statusDeactivated =
        (data.status === "INACTIVE" || data.status === "RESOLVED") &&
        existingAllergy.status === "ACTIVE"

      const statusReactivated =
        data.status === "ACTIVE" &&
        (existingAllergy.status === "INACTIVE" || existingAllergy.status === "RESOLVED")

      if (statusDeactivated) {
        const remainingAllergies = await tx.patientAllergy.count({
          where: {
            patientId: existingAllergy.patientId,
            deletedAt: null,
            status: "ACTIVE",
          },
        })

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
      } else if (statusReactivated) {
        await tx.patient.update({
          where: { id: existingAllergy.patientId },
          data: {
            allergyStatus: "HAS_ALLERGIES",
            allergyConfirmedAt: new Date(),
            allergyConfirmedById: session.userId,
          },
        })
      }
    }

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

  revalidatePath(`/patients/${existingAllergy.patientId}`)

  return {
    ok: true,
    data: allergy,
  }
}
