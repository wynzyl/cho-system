"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { createPatientSchema, type CreatePatientInput } from "@/lib/validators/patient"
import { generatePatientCode } from "@/lib/utils/patient-code"
import type { ActionResult } from "@/lib/auth/types"
import { Patient } from "@prisma/client"

export async function createPatientAction(
  input: CreatePatientInput
): Promise<ActionResult<Patient>> {
  const session = await requireRoleForAction(["REGISTRATION"])

  const parsed = createPatientSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string
      if (!fieldErrors[field]) {
        fieldErrors[field] = []
      }
      fieldErrors[field].push(issue.message)
    }
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        fieldErrors,
      },
    }
  }

  const data = parsed.data

  // Convert empty strings to null for optional unique fields
  const emptyToNull = (val: string | undefined | null) =>
    val?.trim() ? val.trim() : null

  const patient = await db.$transaction(async (tx) => {
    const patientCode = await generatePatientCode(tx)

    const newPatient = await tx.patient.create({
      data: {
        patientCode,
        firstName: data.firstName.trim(),
        middleName: emptyToNull(data.middleName),
        lastName: data.lastName.trim(),
        birthDate: data.birthDate,
        sex: data.sex,
        phone: emptyToNull(data.phone),
        philhealthNo: emptyToNull(data.philhealthNo),
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
