"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"
import { z } from "zod"
import { getClaimExpiryThreshold } from "@/lib/utils/date"
import { notFoundError, alreadyClaimedError } from "@/lib/utils/action-helpers"

const inputSchema = z.object({
  encounterId: z.string().uuid("Invalid encounter ID"),
})

type ClaimEncounterInput = z.infer<typeof inputSchema>

export async function claimEncounterAction(
  input: ClaimEncounterInput
): Promise<ActionResult<{ claimed: true }>> {
  const session = await requireRoleForAction(["TRIAGE"])

  const validation = validateInput(inputSchema, input)
  if (!validation.ok) return validation.result
  const { encounterId } = validation.data
  const now = new Date()
  const expiryThreshold = getClaimExpiryThreshold(now)

  try {
    await db.$transaction(async (tx) => {
      const encounter = await tx.encounter.findFirst({
        where: {
          id: encounterId,
          status: "WAIT_TRIAGE",
          facilityId: session.facilityId,
          deletedAt: null,
        },
        select: {
          id: true,
          claimedById: true,
          claimedAt: true,
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
        return notFoundError("Encounter", "Encounter not found or no longer waiting for triage")
      }
      if (error.message === "ALREADY_CLAIMED") {
        return alreadyClaimedError("This patient is already being processed by another user")
      }
    }
    throw error
  }
}
