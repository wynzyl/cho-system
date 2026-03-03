"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"
import { claimForConsultSchema } from "@/lib/validators/doctor"

// Claims expire after 15 minutes (stale session protection)
const CLAIM_EXPIRY_MS = 15 * 60 * 1000

export async function claimForConsultAction(input: {
  encounterId: string
}): Promise<ActionResult<{ claimed: true }>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const validation = validateInput(claimForConsultSchema, input)
  if (!validation.ok) return validation.result
  const { encounterId } = validation.data
  const now = new Date()
  const expiryThreshold = new Date(now.getTime() - CLAIM_EXPIRY_MS)

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

      // Get today's date range (must match get-doctor-queue.ts)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      // FIFO enforcement: verify no earlier unclaimed patients exist TODAY
      const earlierUnclaimed = await tx.encounter.findFirst({
        where: {
          facilityId: session.facilityId,
          status: "WAIT_DOCTOR",
          deletedAt: null,
          occurredAt: {
            gte: today,           // Only check today's encounters
            lt: encounter.occurredAt,
          },
          OR: [
            { claimedById: null },
            { claimedAt: { lte: expiryThreshold } },
          ],
        },
        select: { id: true },
      })

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
        return {
          ok: false,
          error: {
            code: "NOT_FOUND",
            message: "Encounter not found or no longer waiting for doctor",
          },
        }
      }
      if (error.message === "ALREADY_CLAIMED") {
        return {
          ok: false,
          error: {
            code: "ALREADY_CLAIMED",
            message: "This patient is already being reviewed by another doctor",
          },
        }
      }
      if (error.message === "FIFO_VIOLATION") {
        return {
          ok: false,
          error: {
            code: "FIFO_VIOLATION",
            message: "You must select the first patient in the queue",
          },
        }
      }
    }
    throw error
  }
}
