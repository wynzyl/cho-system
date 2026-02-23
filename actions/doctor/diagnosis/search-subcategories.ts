"use server"

import { Prisma } from "@prisma/client"
import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import type { ActionResult } from "@/lib/auth/types"
import {
  searchSubcategoriesSchema,
  type SearchSubcategoriesInput,
} from "@/lib/validators/diagnosis"

export type IcdMappingResult = {
  id: string
  icd10Code: string
  icdTitle: string
  isDefault: boolean
}

export type SubcategorySearchResult = {
  id: string
  code: string
  name: string
  description: string | null
  isNotifiable: boolean
  isAnimalBite: boolean
  category: {
    id: string
    code: string
    name: string
  }
  icdMappings?: IcdMappingResult[]
}

export async function searchSubcategoriesAction(
  input?: Partial<SearchSubcategoriesInput>
): Promise<ActionResult<SubcategorySearchResult[]>> {
  await requireRoleForAction(["DOCTOR"])

  const parsed = searchSubcategoriesSchema.safeParse(input ?? {})
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

  const { query, categoryId, includeIcd, isNotifiable, isAnimalBite, limit } = parsed.data

  // Build the where clause
  const whereClause: Prisma.DiagnosisSubcategoryWhereInput = {
    isActive: true,
    category: { isActive: true },
  }

  if (categoryId) {
    whereClause.categoryId = categoryId
  }

  if (isNotifiable !== undefined) {
    whereClause.isNotifiable = isNotifiable
  }

  if (isAnimalBite !== undefined) {
    whereClause.isAnimalBite = isAnimalBite
  }

  // Search by name, code, or ICD-10 code
  if (query && query.trim().length > 0) {
    const searchTerm = query.trim()
    whereClause.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { code: { contains: searchTerm, mode: "insensitive" } },
      {
        icdMappings: {
          some: {
            OR: [
              { icd10Code: { contains: searchTerm, mode: "insensitive" } },
              { icdTitle: { contains: searchTerm, mode: "insensitive" } },
            ],
            isActive: true,
          },
        },
      },
    ]
  }

  const subcategories = await db.diagnosisSubcategory.findMany({
    where: whereClause,
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      isNotifiable: true,
      isAnimalBite: true,
      category: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      icdMappings: includeIcd
        ? {
            where: { isActive: true },
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
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    take: limit,
  })

  return {
    ok: true,
    data: subcategories,
  }
}
