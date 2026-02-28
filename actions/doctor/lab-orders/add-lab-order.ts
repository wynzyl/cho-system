"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { addLabOrderSchema, type AddLabOrderInput } from "@/lib/validators/doctor"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"

export interface LabOrderResult {
  id: string
  status: string
  items: {
    id: string
    testCode: string | null
    testName: string
    notes: string | null
  }[]
  requestedAt: Date
}

export async function addLabOrderAction(
  input: AddLabOrderInput
): Promise<ActionResult<LabOrderResult>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const validation = validateInput(addLabOrderSchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  // Verify encounter exists and is in IN_CONSULT status with this doctor
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
        select: {
          patientCode: true,
        },
      },
      facility: {
        select: {
          id: true,
          type: true,
        },
      },
    },
  })

  if (!encounter) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Encounter not found or you are not the assigned doctor",
      },
    }
  }

  // Find main facility for lab work
  const mainFacility = await db.facility.findFirst({
    where: {
      type: "MAIN",
      isActive: true,
      deletedAt: null,
    },
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

  const labOrder = await db.$transaction(async (tx) => {
    // Create lab order with items
    const created = await tx.labOrder.create({
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

    // Create audit log
    await tx.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: "CREATE",
        entity: "LabOrder",
        entityId: created.id,
        metadata: {
          patientCode: encounter.patient.patientCode,
          encounterId: data.encounterId,
          itemCount: data.items.length,
          tests: data.items.map((i) => i.testName),
        },
      },
    })

    return created
  })

  return {
    ok: true,
    data: {
      id: labOrder.id,
      status: labOrder.status,
      items: labOrder.items,
      requestedAt: labOrder.requestedAt,
    },
  }
}
