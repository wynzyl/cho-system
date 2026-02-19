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
  const patientCode = await generatePatientCode()

  const patient = await db.patient.create({
    data: {
      patientCode,
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      birthDate: data.birthDate,
      sex: data.sex,
      phone: data.phone,
      philhealthNo: data.philhealthNo,
      addressLine: data.addressLine,
      barangayId: data.barangayId,
      notes: data.notes,
    },
  })

  await db.auditLog.create({
    data: {
      userId: session.userId,
      userName: session.name,
      action: "CREATE",
      entity: "Patient",
      entityId: patient.id,
      metadata: { patientCode: patient.patientCode },
    },
  })

  return {
    ok: true,
    data: patient,
  }
}
