import { z } from "zod"

export const searchPatientsSchema = z.strictObject({
  query: z.string().max(100).default(""),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(25),
})

// Eligibility date refinement - reusable for both create and update
const validateEligibilityDates = (data: { philhealthEligibilityStart?: Date | null; philhealthEligibilityEnd?: Date | null }) => {
  if (data.philhealthEligibilityStart && data.philhealthEligibilityEnd) {
    return data.philhealthEligibilityEnd > data.philhealthEligibilityStart
  }
  return true
}

// Base schema without refinement (for .partial() compatibility)
const basePatientSchema = z.strictObject({
  firstName: z.string().min(2, "First name is required").max(100),
  middleName: z.string().max(100).optional(),
  lastName: z.string().min(2, "Last name is required").max(100),
  birthDate: z.coerce.date({ message: "Birth date is required" }),
  sex: z.enum(["MALE", "FEMALE", "OTHER"], { message: "Sex is required" }),
  civilStatus: z.enum(["SINGLE", "MARRIED", "WIDOWED", "SEPARATED", "ANNULLED"], { message: "Civil status is required" }),
  religion: z.enum(["ROMAN_CATHOLIC", "PROTESTANT", "IGLESIA_NI_CRISTO", "ISLAM", "BUDDHIST", "OTHER", "NONE", "UNKNOWN"]).optional(),
  education: z.enum(["NO_FORMAL", "ELEMENTARY", "JUNIOR_HIGH", "SENIOR_HIGH", "VOCATIONAL", "COLLEGE", "POSTGRADUATE", "UNKNOWN"]).optional(),
  bloodType: z.enum(["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE", "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE", "UNKNOWN"]).optional(),
  occupation: z.string().max(100).optional(),
  phone: z.string().min(1, "Phone number is required").max(20),
  philhealthNo: z.string().regex(/^\d{12}$/, "Must be exactly 12 digits").optional().or(z.literal("")),
  philhealthMembershipType: z.enum(["EMPLOYED", "SELF_EMPLOYED", "INDIGENT", "OFW", "LIFETIME", "DEPENDENT", "OTHER"]).optional(),
  philhealthEligibilityStart: z.coerce.date().optional().nullable(),
  philhealthEligibilityEnd: z.coerce.date().optional().nullable(),
  philhealthPrincipalPin: z.string().regex(/^\d{12}$/, "Must be exactly 12 digits").optional().or(z.literal("")),
  addressLine: z.string().max(255).optional(),
  barangayId: z.uuid("Barangay is required"),
  notes: z.string().max(1000).optional(),
})

// Create schema with date validation
export const createPatientSchema = basePatientSchema.refine(
  validateEligibilityDates,
  { message: "End date must be after start date", path: ["philhealthEligibilityEnd"] }
)

// Update schema with date validation
export const updatePatientSchema = basePatientSchema.partial().refine(
  validateEligibilityDates,
  { message: "End date must be after start date", path: ["philhealthEligibilityEnd"] }
)

export type SearchPatientsInput = z.infer<typeof searchPatientsSchema>
export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>
