"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { addAllergySchema, type AddAllergyInput } from "@/lib/validators/patient"
import { validateInput, emptyToNull } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"
import { PatientAllergy } from "@prisma/client"

export async function addAllergyAction(
  input: AddAllergyInput
): Promise<ActionResult<PatientAllergy>> {
  const session = await requireRoleForAction(["REGISTRATION", "TRIAGE", "DOCTOR"])

  const validation = validateInput(addAllergySchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  // Verify patient exists
  const patient = await db.patient.findFirst({
    where: { id: data.patientId, deletedAt: null },
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

  const allergy = await db.$transaction(async (tx) => {
    // Create the allergy record
    const newAllergy = await tx.patientAllergy.create({
      data: {
        patientId: data.patientId,
        allergen: data.allergen.trim(),
        category: data.category || null,
        severity: data.severity,
        reaction: emptyToNull(data.reaction),
        notes: emptyToNull(data.notes),
        status: "ACTIVE",
        recordedById: session.userId,
      },
    })

    // Update patient's allergy status to HAS_ALLERGIES
    await tx.patient.update({
      where: { id: data.patientId },
      data: {
        allergyStatus: "HAS_ALLERGIES",
        allergyConfirmedAt: new Date(),
        allergyConfirmedById: session.userId,
      },
    })

    // Create audit log
    await tx.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: "CREATE",
        entity: "PatientAllergy",
        entityId: newAllergy.id,
        metadata: {
          patientId: data.patientId,
          allergen: data.allergen,
          severity: data.severity,
        },
      },
    })

    return newAllergy
  })

  return {
    ok: true,
    data: allergy,
  }
}
