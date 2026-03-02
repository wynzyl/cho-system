"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { startConsultationSchema } from "@/lib/validators/doctor"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"

// Claims expire after 15 minutes (must match claim-for-consult.ts)
const CLAIM_EXPIRY_MS = 15 * 60 * 1000

export async function startConsultationAction(input: {
  encounterId: string
}): Promise<ActionResult<{ encounterId: string }>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const validation = validateInput(startConsultationSchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  const now = new Date()
  const expiryThreshold = new Date(now.getTime() - CLAIM_EXPIRY_MS)

  // Verify encounter exists and is in WAIT_DOCTOR status
  const encounter = await db.encounter.findFirst({
    where: {
      id: data.encounterId,
      facilityId: session.facilityId,
      status: "WAIT_DOCTOR",
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
        message: "Encounter not found or not ready for consultation",
      },
    }
  }

  // Verify the doctor has a valid (non-expired) claim on this encounter
  const hasValidClaim =
    encounter.claimedById === session.userId &&
    encounter.claimedAt &&
    encounter.claimedAt > expiryThreshold

  if (!hasValidClaim) {
    // Check if someone else has a valid claim
    const claimedByOther =
      encounter.claimedById &&
      encounter.claimedById !== session.userId &&
      encounter.claimedAt &&
      encounter.claimedAt > expiryThreshold

    if (claimedByOther) {
      return {
        ok: false,
        error: {
          code: "CLAIMED_BY_OTHER",
          message: "This patient is being reviewed by another doctor",
        },
      }
    }

    return {
      ok: false,
      error: {
        code: "CLAIM_REQUIRED",
        message: "You must claim this patient before starting consultation",
      },
    }
  }

  await db.$transaction(async (tx) => {
    // Update encounter to IN_CONSULT, assign doctor, and clear claim
    await tx.encounter.update({
      where: { id: data.encounterId },
      data: {
        status: "IN_CONSULT",
        doctorId: session.userId,
        consultStartedAt: now,
        claimedById: null,
        claimedAt: null,
      },
    })

    // Create audit log
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
          previousStatus: "WAIT_DOCTOR",
          newStatus: "IN_CONSULT",
        },
      },
    })
  })

  return {
    ok: true,
    data: { encounterId: data.encounterId },
  }
}
