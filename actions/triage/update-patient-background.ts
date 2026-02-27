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
    select: {
      id: true,
      patientCode: true,
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
    // Update patient with lifestyle and medical background
    await tx.patient.update({
      where: { id: data.patientId },
      data: {
        // Lifestyle
        isSmoker: data.isSmoker ?? undefined,
        smokingPackYears: data.smokingPackYears ?? undefined,
        isAlcohol: data.isAlcohol ?? undefined,
        pregnancyStatus: data.pregnancyStatus ?? undefined,
        pregnancyWeeks: data.pregnancyWeeks ?? undefined,

        // Medical Background (JSON fields)
        medicalHistoryData: data.medicalHistoryData ?? undefined,
        familyHistoryData: data.familyHistoryData ?? undefined,
        socialHistoryData: data.socialHistoryData ?? undefined,

        // Audit trail
        medicalHistoryUpdatedAt: new Date(),
        medicalHistoryUpdatedById: session.userId,
      },
    })

    // Create AuditLog entry
    await tx.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: "UPDATE",
        entity: "Patient",
        entityId: data.patientId,
        metadata: {
          action: "MEDICAL_BACKGROUND_UPDATED",
          patientCode: patient.patientCode,
          updatedFields: Object.keys(data).filter(
            (key) => key !== "patientId" && data[key as keyof typeof data] !== undefined
          ),
        },
      },
    })
  })

  return {
    ok: true,
    data: {
      patientId: data.patientId,
    },
  }
}
