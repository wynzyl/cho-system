"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"
import { claimForConsultSchema } from "@/lib/validators/doctor"
import { getClaimExpiryThreshold, getTodayAndTomorrow } from "@/lib/utils/date"
import { notFoundError, alreadyClaimedError, fifoViolationError } from "@/lib/utils/action-helpers"

export async function claimForConsultAction(input: {
  encounterId: string
}): Promise<ActionResult<{ claimed: true }>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const validation = validateInput(claimForConsultSchema, input)
  if (!validation.ok) return validation.result
  const { encounterId } = validation.data
  const now = new Date()
  const expiryThreshold = getClaimExpiryThreshold(now)

  try {
    await db.$transaction(async (tx) => {
      const encounter = await tx.encounter.findFirst({
        where: {
          id: encounterId,
          status: "WAIT_DOCTOR",
          facilityId: session.facilityId,
          deletedAt: null,
        },
        select: {
          id: true,
          claimedById: true,
          claimedAt: true,
          occurredAt: true,
        },
      })

      if (!encounter) {
        throw new Error("ENCOUNTER_NOT_FOUND")
      }

      // Check if already claimed by another user (and claim is not expired)
      if (
        encounter.claimedById &&
        encounter.claimedById !== session.userId &&
        encounter.claimedAt &&
        encounter.claimedAt > expiryThreshold
      ) {
        throw new Error("ALREADY_CLAIMED")
      }

      // Get today's date range
      const { today, tomorrow } = getTodayAndTomorrow()

      // FIFO enforcement: verify no earlier unclaimed patients exist TODAY
      const earlierUnclaimed = await tx.encounter.findFirst({
        where: {
          facilityId: session.facilityId,
          status: "WAIT_DOCTOR",
          deletedAt: null,
          occurredAt: {
            gte: today,
            lt: encounter.occurredAt,
          },
          OR: [
            { claimedById: null },
            { claimedAt: { lte: expiryThreshold } },
          ],
        },
        select: { id: true },
      })

      // Suppress unused variable warning - tomorrow is used for documentation/consistency
      void tomorrow

      if (earlierUnclaimed) {
        throw new Error("FIFO_VIOLATION")
      }

      // Claim the encounter
      await tx.encounter.update({
        where: { id: encounterId },
        data: {
          claimedById: session.userId,
          claimedAt: now,
        },
      })
    })

    return { ok: true, data: { claimed: true } }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ENCOUNTER_NOT_FOUND") {
        return notFoundError("Encounter", "Encounter not found or no longer waiting for doctor")
      }
      if (error.message === "ALREADY_CLAIMED") {
        return alreadyClaimedError("This patient is already being reviewed by another doctor")
      }
      if (error.message === "FIFO_VIOLATION") {
        return fifoViolationError()
      }
    }
    throw error
  }
}
