import { z } from "zod"

export const searchSubcategoriesSchema = z.strictObject({
  query: z.string().max(100).default(""),
  categoryId: z.uuid().optional(),
  includeIcd: z.boolean().default(true),
  isNotifiable: z.boolean().optional(),
  isAnimalBite: z.boolean().optional(),
  limit: z.number().int().positive().max(100).default(50),
})

export const getCategoriesSchema = z.strictObject({
  includeSubcategories: z.boolean().default(true),
  includeIcdMappings: z.boolean().default(false),
  activeOnly: z.boolean().default(true),
})

export type SearchSubcategoriesInput = z.infer<typeof searchSubcategoriesSchema>
export type GetCategoriesInput = z.infer<typeof getCategoriesSchema>
