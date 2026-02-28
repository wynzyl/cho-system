"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { addPrescriptionSchema, type AddPrescriptionInput } from "@/lib/validators/doctor"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"

export interface PrescriptionResult {
  id: string
  notes: string | null
  items: {
    id: string
    medicineName: string
    dosage: string | null
    frequency: string | null
    duration: string | null
    quantity: number | null
    instructions: string | null
  }[]
  createdAt: Date
}

export async function addPrescriptionAction(
  input: AddPrescriptionInput
): Promise<ActionResult<PrescriptionResult>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const validation = validateInput(addPrescriptionSchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  try {
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

    const prescription = await db.$transaction(async (tx) => {
      // Create prescription with items
      const created = await tx.prescription.create({
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
              instructions: true,
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
          entity: "Prescription",
          entityId: created.id,
          metadata: {
            patientCode: encounter.patient.patientCode,
            encounterId: data.encounterId,
            itemCount: data.items.length,
          },
        },
      })

      return created
    })

    return {
      ok: true,
      data: {
        id: prescription.id,
        notes: prescription.notes,
        items: prescription.items,
        createdAt: prescription.createdAt,
      },
    }
  } catch (error) {
    console.error("addPrescriptionAction error:", error)
    return {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to add prescription",
      },
    }
  }
}
