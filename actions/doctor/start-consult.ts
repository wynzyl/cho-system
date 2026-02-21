"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { startConsultSchema, type StartConsultInput } from "@/lib/validators/doctor"
import type { ActionResult } from "@/lib/auth/types"

export async function startConsultAction(
  input: StartConsultInput
): Promise<ActionResult<{ encounterId: string }>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const parsed = startConsultSchema.safeParse(input)
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

  // Verify encounter exists, is WAIT_DOCTOR, owned by this doctor, and at user's facility
  const encounter = await db.encounter.findFirst({
    where: {
      id: encounterId,
      status: "WAIT_DOCTOR",
      doctorId: session.userId,
      facilityId: session.facilityId,
      deletedAt: null,
    },
    include: {
      patient: {
        select: {
          patientCode: true,
        },
      },
    },
  })

  if (!encounter) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Encounter not found or not in WAIT_DOCTOR status",
      },
    }
  }

  await db.$transaction(async (tx) => {
    // Start consultation
    await tx.encounter.update({
      where: { id: encounterId },
      data: {
        status: "IN_CONSULT",
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
          action: "CONSULTATION_STARTED",
          patientCode: encounter.patient.patientCode,
          previousStatus: "WAIT_DOCTOR",
          newStatus: "IN_CONSULT",
        },
      },
    })
  })

  return {
    ok: true,
    data: { encounterId },
  }
}
