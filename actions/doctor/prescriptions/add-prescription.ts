"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { addPrescriptionSchema, type AddPrescriptionInput } from "@/lib/validators/doctor"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"

export interface AddPrescriptionResult {
  prescriptionId: string
  items: {
    id: string
    medicineName: string
    dosage: string | null
    frequency: string | null
    duration: string | null
    quantity: number | null
  }[]
}

export async function addPrescriptionAction(
  input: AddPrescriptionInput
): Promise<ActionResult<AddPrescriptionResult>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const validation = validateInput(addPrescriptionSchema, input)
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

  // Create prescription with items
  const prescription = await db.prescription.create({
    data: {
      facilityId: session.facilityId,
      encounterId: data.encounterId,
      notes: data.notes ?? null,
      createdById: session.userId,
      items: {
        create: data.items.map((item) => ({
          medicineId: item.medicineId ?? null,
          medicineName: item.medicineName,
          dosage: item.dosage ?? null,
          frequency: item.frequency ?? null,
          duration: item.duration ?? null,
          quantity: item.quantity ?? null,
          instructions: item.instructions ?? null,
        })),
      },
    },
    include: {
      items: {
        select: {
          id: true,
          medicineName: true,
          dosage: true,
          frequency: true,
          duration: true,
          quantity: true,
        },
      },
    },
  })

  return {
    ok: true,
    data: {
      prescriptionId: prescription.id,
      items: prescription.items,
    },
  }
}
