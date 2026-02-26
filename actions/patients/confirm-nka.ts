"use server"

import { db } from "@/lib/db"
import { logAudit } from "@/lib/db/audit"
import { requireRoleForAction } from "@/lib/auth/guards"
import { confirmNkaSchema, type ConfirmNkaInput } from "@/lib/validators/patient"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"
import { Patient } from "@prisma/client"

export async function confirmNkaAction(
  input: ConfirmNkaInput
): Promise<ActionResult<Patient>> {
  const session = await requireRoleForAction(["REGISTRATION", "TRIAGE", "DOCTOR", "ADMIN"])

  const validation = validateInput(confirmNkaSchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  // Verify patient exists
  const patient = await db.patient.findFirst({
    where: { id: data.patientId, deletedAt: null },
    include: {
      allergies: {
        where: { deletedAt: null, status: "ACTIVE" },
      },
    },
  })

  if (!patient) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Patient not found",
      },
    }
  }

  // If patient has active allergies, cannot mark as NKA
  if (patient.allergies.length > 0) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Cannot mark patient as NKA while they have active allergies. Please resolve or remove existing allergies first.",
      },
    }
  }

  const updatedPatient = await db.$transaction(async (tx) => {
    const updated = await tx.patient.update({
      where: { id: data.patientId },
      data: {
        allergyStatus: "NKA",
        allergyConfirmedAt: new Date(),
        allergyConfirmedById: session.userId,
      },
    })

    // Create audit log
    await logAudit(tx, {
      userId: session.userId,
      userName: session.name,
      action: "UPDATE",
      entity: "Patient",
      entityId: data.patientId,
      metadata: {
        field: "allergyStatus",
        oldValue: patient.allergyStatus,
        newValue: "NKA",
      },
    })

    return updated
  })

  return {
    ok: true,
    data: updatedPatient,
  }
}
