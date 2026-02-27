"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import {
  startConsultationSchema,
  type StartConsultationInput,
} from "@/lib/validators/doctor"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"

export async function startConsultationAction(
  input: StartConsultationInput
): Promise<ActionResult<{ encounterId: string; consultStartedAt: Date }>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const validation = validateInput(startConsultationSchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  // Verify encounter exists and is in valid status for starting consultation
  const encounter = await db.encounter.findFirst({
    where: {
      id: data.encounterId,
      facilityId: session.facilityId,
      status: { in: ["TRIAGED", "WAIT_DOCTOR"] },
      deletedAt: null,
    },
    include: {
      patient: {
        select: { patientCode: true },
      },
    },
  })

  if (!encounter) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Encounter not found or not ready for consultation",
      },
    }
  }

  const now = new Date()

  const result = await db.$transaction(async (tx) => {
    // Update encounter to IN_CONSULT and assign doctor
    const updatedEncounter = await tx.encounter.update({
      where: { id: data.encounterId },
      data: {
        status: "IN_CONSULT",
        doctorId: session.userId,
        consultStartedAt: now,
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
          action: "CONSULTATION_STARTED",
          patientCode: encounter.patient.patientCode,
          previousStatus: encounter.status,
          newStatus: "IN_CONSULT",
        },
      },
    })

    return updatedEncounter
  })

  return {
    ok: true,
    data: {
      encounterId: result.id,
      consultStartedAt: result.consultStartedAt!,
    },
  }
}
