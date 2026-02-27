"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { addLabOrderSchema, type AddLabOrderInput } from "@/lib/validators/doctor"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"

export interface AddLabOrderResult {
  labOrderId: string
  items: {
    id: string
    testCode: string | null
    testName: string
    notes: string | null
  }[]
}

export async function addLabOrderAction(
  input: AddLabOrderInput
): Promise<ActionResult<AddLabOrderResult>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const validation = validateInput(addLabOrderSchema, input)
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

  // Get main facility for lab work
  const mainFacility = await db.facility.findFirst({
    where: {
      type: "MAIN",
      isActive: true,
      deletedAt: null,
    },
    select: { id: true },
  })

  if (!mainFacility) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Main facility not found for lab orders",
      },
    }
  }

  // Create lab order with items
  const labOrder = await db.labOrder.create({
    data: {
      encounterId: data.encounterId,
      status: "PENDING",
      requestedFacilityId: session.facilityId,
      performingFacilityId: mainFacility.id,
      requestedById: session.userId,
      items: {
        create: data.items.map((item) => ({
          testCode: item.testCode ?? null,
          testName: item.testName,
          notes: item.notes ?? null,
        })),
      },
    },
    include: {
      items: {
        select: {
          id: true,
          testCode: true,
          testName: true,
          notes: true,
        },
      },
    },
  })

  return {
    ok: true,
    data: {
      labOrderId: labOrder.id,
      items: labOrder.items,
    },
  }
}
