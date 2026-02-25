"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { createPatientSchema, type CreatePatientInput } from "@/lib/validators/patient"
import { generatePatientCode } from "@/lib/utils/patient-code"
import { validateInput, emptyToNull } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"
import { Patient } from "@prisma/client"

export async function createPatientAction(
  input: CreatePatientInput
): Promise<ActionResult<Patient>> {
  const session = await requireRoleForAction(["REGISTRATION"])

  const validation = validateInput(createPatientSchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  const patient = await db.$transaction(async (tx) => {
    const patientCode = await generatePatientCode(tx)

    const hasPhilHealthInfo = data.philhealthNo || data.philhealthMembershipType

    const newPatient = await tx.patient.create({
      data: {
        patientCode,
        firstName: data.firstName.trim(),
        middleName: emptyToNull(data.middleName),
        lastName: data.lastName.toUpperCase().trim(),
        birthDate: data.birthDate,
        sex: data.sex,
        civilStatus: data.civilStatus || null,
        religion: data.religion || null,
        education: data.education || null,
        bloodType: data.bloodType || null,
        occupation: emptyToNull(data.occupation),
        phone: emptyToNull(data.phone),
        philhealthNo: emptyToNull(data.philhealthNo),
        philhealthMembershipType: data.philhealthMembershipType || null,
        philhealthEligibilityStart: data.philhealthEligibilityStart || null,
        philhealthEligibilityEnd: data.philhealthEligibilityEnd || null,
        philhealthPrincipalPin: data.philhealthMembershipType === "DEPENDENT"
          ? emptyToNull(data.philhealthPrincipalPin)
          : null,
        philhealthUpdatedAt: hasPhilHealthInfo ? new Date() : null,
        addressLine: emptyToNull(data.addressLine),
        barangayId: data.barangayId || null,
        notes: emptyToNull(data.notes),
      },
    })

    await tx.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: "CREATE",
        entity: "Patient",
        entityId: newPatient.id,
        metadata: { patientCode: newPatient.patientCode },
      },
    })

    return newPatient
  })

  return {
    ok: true,
    data: patient,
  }
}
