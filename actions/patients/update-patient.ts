"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { updatePatientSchema, type UpdatePatientInput } from "@/lib/validators/patient"
import { validateInput, emptyToNull } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"
import { Patient } from "@prisma/client"

export async function updatePatientAction(
  patientId: string,
  input: UpdatePatientInput
): Promise<ActionResult<Patient>> {
  const session = await requireRoleForAction(["REGISTRATION"])

  if (!patientId || typeof patientId !== "string") {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid patient ID",
      },
    }
  }

  const validation = validateInput(updatePatientSchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  const result = await db.$transaction(async (tx) => {
    const existing = await tx.patient.findFirst({
      where: { id: patientId, deletedAt: null },
    })

    if (!existing) {
      return { found: false as const }
    }

    // Determine if PhilHealth info is being updated
    const hasPhilHealthUpdate = data.philhealthNo !== undefined ||
      data.philhealthMembershipType !== undefined ||
      data.philhealthEligibilityStart !== undefined ||
      data.philhealthEligibilityEnd !== undefined ||
      data.philhealthPrincipalPin !== undefined

    const patient = await tx.patient.update({
      where: { id: patientId },
      data: {
        firstName: data.firstName?.trim(),
        middleName: emptyToNull(data.middleName),
        lastName: data.lastName?.trim(),
        birthDate: data.birthDate,
        sex: data.sex,
        civilStatus: data.civilStatus,
        religion: data.religion,
        education: data.education,
        bloodType: data.bloodType,
        occupation: emptyToNull(data.occupation),
        phone: emptyToNull(data.phone),
        philhealthNo: emptyToNull(data.philhealthNo),
        philhealthMembershipType: data.philhealthMembershipType || null,
        philhealthEligibilityStart: data.philhealthEligibilityStart || null,
        philhealthEligibilityEnd: data.philhealthEligibilityEnd || null,
        philhealthPrincipalPin: data.philhealthMembershipType === "DEPENDENT"
          ? emptyToNull(data.philhealthPrincipalPin)
          : null,
        philhealthUpdatedAt: hasPhilHealthUpdate ? new Date() : undefined,
        addressLine: emptyToNull(data.addressLine),
        barangayId: data.barangayId || null,
        notes: emptyToNull(data.notes),
      },
    })

    await tx.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: "UPDATE",
        entity: "Patient",
        entityId: patient.id,
        metadata: { patientCode: patient.patientCode },
      },
    })

    return { found: true as const, patient }
  })

  if (!result.found) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Patient not found",
      },
    }
  }

  return {
    ok: true,
    data: result.patient,
  }
}
