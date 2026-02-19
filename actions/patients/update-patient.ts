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

  const data = parsed.data

  // Convert empty strings to null for optional unique fields
  const emptyToNull = (val: string | undefined | null) =>
    val?.trim() ? val.trim() : null

  const result = await db.$transaction(async (tx) => {
    const existing = await tx.patient.findFirst({
      where: { id: patientId, deletedAt: null },
    })

    if (!existing) {
      return { found: false as const }
    }

    const patient = await tx.patient.update({
      where: { id: patientId },
      data: {
        firstName: data.firstName?.trim(),
        middleName: emptyToNull(data.middleName),
        lastName: data.lastName?.trim(),
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
