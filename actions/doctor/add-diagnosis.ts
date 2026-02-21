"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { addDiagnosisSchema, type AddDiagnosisInput } from "@/lib/validators/doctor"
import type { ActionResult } from "@/lib/auth/types"

export async function addDiagnosisAction(
  input: AddDiagnosisInput
): Promise<ActionResult<{ diagnosisId: string }>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const parsed = addDiagnosisSchema.safeParse(input)
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

  const { encounterId, text, diagnosisCodeId } = parsed.data

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

  // If diagnosisCodeId provided, verify it exists
  if (diagnosisCodeId) {
    const code = await db.diagnosisCode.findFirst({
      where: {
        id: diagnosisCodeId,
        isActive: true,
      },
    })
    if (!code) {
      return {
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Diagnosis code not found",
        },
      }
    }
  }

  const diagnosis = await db.$transaction(async (tx) => {
    // Create diagnosis
    const created = await tx.diagnosis.create({
      data: {
        encounterId,
        text,
        diagnosisCodeId: diagnosisCodeId ?? null,
        createdById: session.userId,
      },
    })

    // Create audit log
    await tx.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: "CREATE",
        entity: "Diagnosis",
        entityId: created.id,
        metadata: {
          action: "DIAGNOSIS_ADDED",
          patientCode: encounter.patient.patientCode,
          encounterId,
          diagnosisText: text,
          diagnosisCodeId: diagnosisCodeId ?? null,
        },
      },
    })

    return created
  })

  return {
    ok: true,
    data: { diagnosisId: diagnosis.id },
  }
}
