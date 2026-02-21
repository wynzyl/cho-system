"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { completeConsultationSchema, type CompleteConsultationInput } from "@/lib/validators/doctor"
import type { ActionResult } from "@/lib/auth/types"
import type { EncounterStatus } from "@prisma/client"

export async function completeConsultationAction(
  input: CompleteConsultationInput
): Promise<ActionResult<{ encounterId: string; newStatus: EncounterStatus }>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const parsed = completeConsultationSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0])
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

  const { encounterId } = parsed.data

  // Verify encounter exists, is owned by this doctor, and is IN_CONSULT
  const encounter = await db.encounter.findFirst({
    where: {
      id: encounterId,
      doctorId: session.userId,
      status: "IN_CONSULT",
      facilityId: session.facilityId,
      deletedAt: null,
    },
    include: {
      patient: {
        select: {
          patientCode: true,
        },
      },
      prescriptions: {
        where: { deletedAt: null },
        select: { id: true },
      },
      diagnoses: {
        where: { deletedAt: null },
        select: { id: true },
      },
    },
  })

  if (!encounter) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Encounter not found or not in consultation",
      },
    }
  }

  // Require at least one diagnosis before completing
  if (encounter.diagnoses.length === 0) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "At least one diagnosis is required before completing consultation",
      },
    }
  }

  // Determine next status based on prescriptions
  // If prescriptions exist, send to pharmacy; otherwise, mark as done
  const hasPrescriptions = encounter.prescriptions.length > 0
  const newStatus: EncounterStatus = hasPrescriptions ? "FOR_PHARMACY" : "DONE"

  await db.$transaction(async (tx) => {
    // Update encounter status
    await tx.encounter.update({
      where: { id: encounterId },
      data: {
        status: newStatus,
      },
    })

    // Create audit log
    await tx.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: "UPDATE",
        entity: "Encounter",
        entityId: encounterId,
        metadata: {
          action: "CONSULTATION_COMPLETED",
          patientCode: encounter.patient.patientCode,
          previousStatus: "IN_CONSULT",
          newStatus,
          diagnosisCount: encounter.diagnoses.length,
          prescriptionCount: encounter.prescriptions.length,
        },
      },
    })
  })

  return {
    ok: true,
    data: { encounterId, newStatus },
  }
}
