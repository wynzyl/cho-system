import { z } from "zod"

export const searchPatientsSchema = z.object({
  query: z.string().max(100).default(""),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(25),
}).strict()

export const createPatientSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  middleName: z.string().max(100).optional(),
  lastName: z.string().min(1, "Last name is required").max(100),
  birthDate: z.coerce.date({ message: "Birth date is required" }),
  sex: z.enum(["MALE", "FEMALE", "OTHER", "UNKNOWN"]).default("UNKNOWN"),
  phone: z.string().max(20).optional(),
  philhealthNo: z.string().max(20).optional(),
  addressLine: z.string().max(255).optional(),
  barangayId: z.string().uuid().optional().nullable(),
  notes: z.string().max(1000).optional(),
}).strict()

export const updatePatientSchema = createPatientSchema.partial()

export type SearchPatientsInput = z.infer<typeof searchPatientsSchema>
export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>
