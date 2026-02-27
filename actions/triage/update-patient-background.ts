"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import {
  updatePatientBackgroundSchema,
  type UpdatePatientBackgroundInput,
} from "@/lib/validators/triage"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"

export async function updatePatientBackgroundAction(
  input: UpdatePatientBackgroundInput
): Promise<ActionResult<{ patientId: string }>> {
  const session = await requireRoleForAction(["TRIAGE", "DOCTOR"])

  const validation = validateInput(updatePatientBackgroundSchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  // Verify patient exists
  const patient = await db.patient.findFirst({
    where: {
      id: data.patientId,
      deletedAt: null,
    },
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

  await db.$transaction(async (tx) => {
    // Update patient background
    await tx.patient.update({
      where: { id: data.patientId },
      data: {
        isSmoker: data.isSmoker ?? undefined,
        smokingPackYears: data.smokingPackYears ?? undefined,
        isAlcohol: data.isAlcohol ?? undefined,
        pregnancyStatus: data.pregnancyStatus ?? undefined,
        pregnancyWeeks: data.pregnancyWeeks ?? undefined,
        medicalHistoryData: data.medicalHistoryData ?? undefined,
        familyHistoryData: data.familyHistoryData ?? undefined,
        medicalHistoryUpdatedAt: new Date(),
        medicalHistoryUpdatedById: session.userId,
      },
    })

    // Create audit log
    await tx.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: "UPDATE",
        entity: "Patient",
        entityId: data.patientId,
        metadata: {
          action: "BACKGROUND_UPDATED",
          patientCode: patient.patientCode,
          updatedFields: Object.keys(data).filter(
            (k) => k !== "patientId" && data[k as keyof typeof data] !== undefined
          ),
        },
      },
    })
  })

  return {
    ok: true,
    data: { patientId: data.patientId },
  }
}
