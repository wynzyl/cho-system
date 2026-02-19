"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { updatePatientSchema, type UpdatePatientInput } from "@/lib/validators/patient"
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

  const parsed = updatePatientSchema.safeParse(input)
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

  const existing = await db.patient.findFirst({
    where: { id: patientId, deletedAt: null },
  })

  if (!existing) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Patient not found",
      },
    }
  }

  const data = parsed.data
  const patient = await db.patient.update({
    where: { id: patientId },
    data: {
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
      action: "UPDATE",
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
