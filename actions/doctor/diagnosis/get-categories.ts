"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import type { ActionResult } from "@/lib/auth/types"
import { getCategoriesSchema, type GetCategoriesInput } from "@/lib/validators/diagnosis"

export type IcdMappingOption = {
  id: string
  icd10Code: string
  icdTitle: string
  isDefault: boolean
}

export type SubcategoryOption = {
  id: string
  code: string
  name: string
  description: string | null
  isNotifiable: boolean
  isAnimalBite: boolean
  sortOrder: number
  icdMappings?: IcdMappingOption[]
}

export type CategoryWithSubcategories = {
  id: string
  code: string
  name: string
  description: string | null
  sortOrder: number
  subcategories?: SubcategoryOption[]
}

export async function getCategoriesAction(
  input?: Partial<GetCategoriesInput>
): Promise<ActionResult<CategoryWithSubcategories[]>> {
  await requireRoleForAction(["DOCTOR"])

  const parsed = getCategoriesSchema.safeParse(input ?? {})
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      },
    }
  }

  const { includeSubcategories, includeIcdMappings, activeOnly } = parsed.data

  const categories = await db.diagnosisCategory.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      sortOrder: true,
      subcategories: includeSubcategories
        ? {
            where: activeOnly ? { isActive: true } : undefined,
            select: {
              id: true,
              code: true,
              name: true,
              description: true,
              isNotifiable: true,
              isAnimalBite: true,
              sortOrder: true,
              icdMappings: includeIcdMappings
                ? {
                    where: activeOnly ? { isActive: true } : undefined,
                    select: {
                      id: true,
                      icd10Code: true,
                      icdTitle: true,
                      isDefault: true,
                    },
                    orderBy: [{ isDefault: "desc" }, { icd10Code: "asc" }],
                  }
                : false,
            },
            orderBy: { sortOrder: "asc" },
          }
        : false,
    },
    orderBy: { sortOrder: "asc" },
  })

  return {
    ok: true,
    data: categories,
  }
}
