"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"
import { releaseFromConsultSchema } from "@/lib/validators/doctor"

export async function releaseFromConsultAction(input: {
  encounterId: string
}): Promise<ActionResult<{ released: true }>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const validation = validateInput(releaseFromConsultSchema, input)
  if (!validation.ok) return validation.result
  const { encounterId } = validation.data

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
          status: true,
        },
      })

      if (!encounter) {
        throw new Error("ENCOUNTER_NOT_FOUND")
      }

      // Only the claiming user can release (or if no claim exists)
      if (encounter.claimedById && encounter.claimedById !== session.userId) {
        throw new Error("NOT_CLAIM_OWNER")
      }

      // Only release claim if encounter is still in WAIT_DOCTOR status
      // Once consultation starts (IN_CONSULT), the claim is no longer relevant
      if (encounter.status !== "WAIT_DOCTOR") {
        // Silently succeed - encounter has already moved past the claim stage
        return
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
            message: "You cannot release another doctor's claim",
          },
        }
      }
    }
    throw error
  }
}
