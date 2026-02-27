"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import {
  completeConsultationSchema,
  type CompleteConsultationInput,
} from "@/lib/validators/doctor"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"

export async function completeConsultationAction(
  input: CompleteConsultationInput
): Promise<ActionResult<{ encounterId: string; status: string; completedAt: Date }>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const validation = validateInput(completeConsultationSchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  // Verify encounter exists and is being consulted by this doctor
  const encounter = await db.encounter.findFirst({
    where: {
      id: data.encounterId,
      facilityId: session.facilityId,
      status: "IN_CONSULT",
      doctorId: session.userId,
      deletedAt: null,
    },
    include: {
      patient: {
        select: { patientCode: true },
      },
      diagnoses: {
        where: { deletedAt: null },
      },
    },
  })

  if (!encounter) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Encounter not found or not assigned to you",
      },
    }
  }

  // Validate that at least one diagnosis exists before completing
  if (encounter.diagnoses.length === 0) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "At least one diagnosis is required to complete consultation",
      },
    }
  }

  const now = new Date()

  const result = await db.$transaction(async (tx) => {
    // Update encounter with final consultation data and status
    const updatedEncounter = await tx.encounter.update({
      where: { id: data.encounterId },
      data: {
        status: data.nextStatus,
        consultEndedAt: now,
        hpiDoctorNotes: data.hpiDoctorNotes ?? undefined,
        physicalExamData: data.physicalExamData ?? undefined,
        clinicalImpression: data.clinicalImpression ?? undefined,
        proceduresData: data.proceduresData ?? undefined,
        adviceData: data.adviceData ?? undefined,
      },
    })

    // Create AuditLog entry
    await tx.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: "UPDATE",
        entity: "Encounter",
        entityId: data.encounterId,
        metadata: {
          action: "CONSULTATION_COMPLETED",
          patientCode: encounter.patient.patientCode,
          previousStatus: "IN_CONSULT",
          newStatus: data.nextStatus,
          diagnosesCount: encounter.diagnoses.length,
        },
      },
    })

    return updatedEncounter
  })

  return {
    ok: true,
    data: {
      encounterId: result.id,
      status: result.status,
      completedAt: now,
    },
  }
}
