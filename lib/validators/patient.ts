import { z } from "zod"

export const searchPatientsSchema = z.strictObject({
  query: z.string().max(100).default(""),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(25),
})

export const createPatientSchema = z.strictObject({
  firstName: z.string().min(1, "First name is required").max(100),
  middleName: z.string().max(100).optional(),
  lastName: z.string().min(1, "Last name is required").max(100),
  birthDate: z.coerce.date({ message: "Birth date is required" }),
  sex: z.enum(["MALE", "FEMALE", "OTHER"], { message: "Sex is required" }),
  civilStatus: z.enum(["SINGLE", "MARRIED", "WIDOWED", "SEPARATED", "ANNULLED"], { message: "Civil status is required" }),
  religion: z.enum(["ROMAN_CATHOLIC", "PROTESTANT", "IGLESIA_NI_CRISTO", "ISLAM", "BUDDHIST", "OTHER", "NONE", "UNKNOWN"]).optional(),
  education: z.enum(["NO_FORMAL", "ELEMENTARY", "JUNIOR_HIGH", "SENIOR_HIGH", "VOCATIONAL", "COLLEGE", "POSTGRADUATE", "UNKNOWN"]).optional(),
  occupation: z.string().max(100).optional(),
  phone: z.string().min(1, "Phone number is required").max(20),
  philhealthNo: z.string().max(20).optional(),
  addressLine: z.string().max(255).optional(),
  barangayId: z.uuid("Barangay is required"),
  notes: z.string().max(1000).optional(),
})

export const updatePatientSchema = createPatientSchema.partial()

export type SearchPatientsInput = z.infer<typeof searchPatientsSchema>
export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>
