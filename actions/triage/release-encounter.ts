"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import type { ActionResult } from "@/lib/auth/types"
import { z } from "zod"

const inputSchema = z.object({
  encounterId: z.string().uuid("Invalid encounter ID"),
})

type ReleaseEncounterInput = z.infer<typeof inputSchema>

export async function releaseEncounterAction(
  input: ReleaseEncounterInput
): Promise<ActionResult<{ released: true }>> {
  const session = await requireRoleForAction(["TRIAGE"])

  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid encounter ID",
      },
    }
  }

  const { encounterId } = parsed.data

  try {
    await db.$transaction(async (tx) => {
      const encounter = await tx.encounter.findFirst({
        where: {
          id: encounterId,
          deletedAt: null,
        },
        select: {
          id: true,
          claimedById: true,
        },
      })

      if (!encounter) {
        throw new Error("ENCOUNTER_NOT_FOUND")
      }

      // Only the claiming user can release (or if no claim exists)
      if (encounter.claimedById && encounter.claimedById !== session.userId) {
        throw new Error("NOT_CLAIM_OWNER")
      }

      // Release the claim
      await tx.encounter.update({
        where: { id: encounterId },
        data: {
          claimedById: null,
          claimedAt: null,
        },
      })
    })

    return { ok: true, data: { released: true } }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ENCOUNTER_NOT_FOUND") {
        return {
          ok: false,
          error: {
            code: "NOT_FOUND",
            message: "Encounter not found",
          },
        }
      }
      if (error.message === "NOT_CLAIM_OWNER") {
        return {
          ok: false,
          error: {
            code: "FORBIDDEN",
            message: "You cannot release another user's claim",
          },
        }
      }
    }
    throw error
  }
}
