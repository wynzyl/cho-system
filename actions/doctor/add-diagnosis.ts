"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { addDiagnosisSchema, type AddDiagnosisInput } from "@/lib/validators/doctor"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"

export interface AddDiagnosisResult {
  diagnosisId: string
  text: string
  subcategory: {
    id: string
    code: string
    name: string
    icdMappings: {
      icd10Code: string
      icdTitle: string
      isDefault: boolean
    }[]
  } | null
}

export async function addDiagnosisAction(
  input: AddDiagnosisInput
): Promise<ActionResult<AddDiagnosisResult>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const validation = validateInput(addDiagnosisSchema, input)
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

  // If subcategoryId provided, verify it exists
  let subcategory = null
  if (data.subcategoryId) {
    subcategory = await db.diagnosisSubcategory.findFirst({
      where: {
        id: data.subcategoryId,
        isActive: true,
        deletedAt: null,
      },
      include: {
        icdMappings: {
          where: { isActive: true, deletedAt: null },
          select: {
            icd10Code: true,
            icdTitle: true,
            isDefault: true,
          },
        },
      },
    })

    if (!subcategory) {
      return {
        ok: false,
        error: {
          code: "NOT_FOUND",
          message: "Diagnosis subcategory not found",
        },
      }
    }
  }

  // Create diagnosis
  const diagnosis = await db.diagnosis.create({
    data: {
      encounterId: data.encounterId,
      text: data.text,
      subcategoryId: data.subcategoryId ?? null,
      createdById: session.userId,
    },
  })

  return {
    ok: true,
    data: {
      diagnosisId: diagnosis.id,
      text: diagnosis.text,
      subcategory: subcategory
        ? {
            id: subcategory.id,
            code: subcategory.code,
            name: subcategory.name,
            icdMappings: subcategory.icdMappings,
          }
        : null,
    },
  }
}
