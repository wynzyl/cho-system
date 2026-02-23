import { z } from "zod"

export const searchSubcategoriesSchema = z.object({
  query: z.string().max(100).default(""),
  categoryId: z.string().uuid().optional(),
  includeIcd: z.boolean().default(true),
  isNotifiable: z.boolean().optional(),
  isAnimalBite: z.boolean().optional(),
  limit: z.number().int().positive().max(100).default(50),
}).strict()

export const getCategoriesSchema = z.object({
  includeSubcategories: z.boolean().default(true),
  includeIcdMappings: z.boolean().default(false),
  activeOnly: z.boolean().default(true),
}).strict()

export type SearchSubcategoriesInput = z.infer<typeof searchSubcategoriesSchema>
export type GetCategoriesInput = z.infer<typeof getCategoriesSchema>
