"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { createPrescriptionSchema, type CreatePrescriptionInput } from "@/lib/validators/doctor"
import type { ActionResult } from "@/lib/auth/types"

export async function createPrescriptionAction(
  input: CreatePrescriptionInput
): Promise<ActionResult<{ prescriptionId: string }>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const parsed = createPrescriptionSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0])
      if (!fieldErrors[field]) {
        fieldErrors[field] = []
      }
      fieldErrors[field].push(issue.message)
    }
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        fieldErrors,
      },
    }
  }

  const { encounterId, notes, items } = parsed.data

  // Verify encounter exists, is owned by this doctor, and is IN_CONSULT
  const encounter = await db.encounter.findFirst({
    where: {
      id: encounterId,
      doctorId: session.userId,
      status: "IN_CONSULT",
      facilityId: session.facilityId,
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
        message: "Encounter not found or not in consultation",
      },
    }
  }

  const prescription = await db.$transaction(async (tx) => {
    // Create prescription with items
    const created = await tx.prescription.create({
      data: {
        facilityId: session.facilityId,
        encounterId,
        notes: notes ?? null,
        createdById: session.userId,
        items: {
          create: items.map((item) => ({
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
        items: true,
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
          action: "PRESCRIPTION_CREATED",
          patientCode: encounter.patient.patientCode,
          encounterId,
          itemCount: items.length,
          medicineNames: items.map((i) => i.medicineName),
        },
      },
    })

    return created
  })

  return {
    ok: true,
    data: { prescriptionId: prescription.id },
  }
}
