"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { addDiagnosisSchema, type AddDiagnosisInput } from "@/lib/validators/doctor"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"

export interface AddDiagnosisResult {
  id: string
  text: string
  subcategoryId: string | null
  subcategory: {
    code: string
    name: string
    icdMappings: {
      icd10Code: string
      icdTitle: string
      isDefault: boolean
    }[]
  } | null
  createdAt: Date
}

export async function addDiagnosisAction(
  input: AddDiagnosisInput
): Promise<ActionResult<AddDiagnosisResult>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const validation = validateInput(addDiagnosisSchema, input)
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

  // If subcategoryId is provided, verify it exists
  if (data.subcategoryId) {
    const subcategory = await db.diagnosisSubcategory.findFirst({
      where: {
        id: data.subcategoryId,
        deletedAt: null,
        isActive: true,
      },
    })

    if (!subcategory) {
      return {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid diagnosis subcategory",
        },
      }
    }
  }

  const diagnosis = await db.$transaction(async (tx) => {
    // Create diagnosis
    const created = await tx.diagnosis.create({
      data: {
        encounterId: data.encounterId,
        text: data.text,
        subcategoryId: data.subcategoryId ?? null,
        createdById: session.userId,
      },
      include: {
        subcategory: {
          include: {
            icdMappings: {
              where: { deletedAt: null, isActive: true },
              select: {
                icd10Code: true,
                icdTitle: true,
                isDefault: true,
              },
            },
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
        entity: "Diagnosis",
        entityId: created.id,
        metadata: {
          patientCode: encounter.patient.patientCode,
          encounterId: data.encounterId,
          diagnosisText: data.text,
          subcategoryId: data.subcategoryId ?? null,
        },
      },
    })

    return created
  })

  return {
    ok: true,
    data: {
      id: diagnosis.id,
      text: diagnosis.text,
      subcategoryId: diagnosis.subcategoryId,
      subcategory: diagnosis.subcategory
        ? {
            code: diagnosis.subcategory.code,
            name: diagnosis.subcategory.name,
            icdMappings: diagnosis.subcategory.icdMappings,
          }
        : null,
      createdAt: diagnosis.createdAt,
    },
  }
}
