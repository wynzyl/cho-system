import { z } from "zod"
import {
  SEX_VALUES,
  CIVIL_STATUS_VALUES,
  RELIGION_VALUES,
  EDUCATION_VALUES,
  BLOOD_TYPE_VALUES,
  PHILHEALTH_MEMBERSHIP_TYPE_VALUES,
  ALLERGY_CATEGORY_VALUES,
  ALLERGY_SEVERITY_VALUES,
  ALLERGY_STATUS_VALUES,
} from "@/lib/constants/enums"
import {
  validateEligibilityDates,
  ELIGIBILITY_DATE_ERROR,
  PHILHEALTH_NUMBER_REGEX,
  PHILHEALTH_NUMBER_ERROR,
} from "./refinements"

export const searchPatientsSchema = z.strictObject({
  query: z.string().max(100).default(""),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(25),
})

// Base schema without refinement (for .partial() compatibility)
const basePatientSchema = z.strictObject({
  firstName: z.string().min(2, "First name is required").max(100),
  middleName: z.string().max(100).optional(),
  lastName: z.string().min(2, "Last name is required").max(100),
  birthDate: z.coerce.date({ message: "Birth date is required" }),
  sex: z.enum(SEX_VALUES, { message: "Sex is required" }),
  civilStatus: z.enum(CIVIL_STATUS_VALUES, { message: "Civil status is required" }),
  religion: z.enum(RELIGION_VALUES).optional(),
  education: z.enum(EDUCATION_VALUES).optional(),
  bloodType: z.enum(BLOOD_TYPE_VALUES).optional(),
  occupation: z.string().max(100).optional(),
  phone: z.string().min(1, "Phone number is required").max(20),
  philhealthNo: z.string().regex(PHILHEALTH_NUMBER_REGEX, PHILHEALTH_NUMBER_ERROR).optional().or(z.literal("")),
  philhealthMembershipType: z.enum(PHILHEALTH_MEMBERSHIP_TYPE_VALUES).optional(),
  philhealthEligibilityStart: z.coerce.date().optional().nullable(),
  philhealthEligibilityEnd: z.coerce.date().optional().nullable(),
  philhealthPrincipalPin: z.string().regex(PHILHEALTH_NUMBER_REGEX, PHILHEALTH_NUMBER_ERROR).optional().or(z.literal("")),
  addressLine: z.string().max(255).optional(),
  barangayId: z.uuid("Barangay is required"),
  notes: z.string().max(1000).optional(),
})

// Create schema with date validation
export const createPatientSchema = basePatientSchema.refine(
  validateEligibilityDates,
  ELIGIBILITY_DATE_ERROR
)

// Update schema with date validation
export const updatePatientSchema = basePatientSchema.partial().refine(
  validateEligibilityDates,
  ELIGIBILITY_DATE_ERROR
)

export type SearchPatientsInput = z.infer<typeof searchPatientsSchema>
export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>

// ============================================================================
// Allergy Schemas
// ============================================================================

export const addAllergySchema = z.strictObject({
  patientId: z.uuid("Patient ID is required"),
  allergen: z.string().min(1, "Allergen is required").max(100),
  category: z.enum(ALLERGY_CATEGORY_VALUES).optional(),
  severity: z.enum(ALLERGY_SEVERITY_VALUES, { message: "Severity is required" }),
  reaction: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
})

export const updateAllergySchema = z.strictObject({
  allergyId: z.uuid("Allergy ID is required"),
  allergen: z.string().min(1, "Allergen is required").max(100).optional(),
  category: z.enum(ALLERGY_CATEGORY_VALUES).optional(),
  severity: z.enum(ALLERGY_SEVERITY_VALUES).optional(),
  reaction: z.string().max(200).optional().nullable(),
  status: z.enum(ALLERGY_STATUS_VALUES).optional(),
  notes: z.string().max(500).optional().nullable(),
})

export const removeAllergySchema = z.strictObject({
  allergyId: z.uuid("Allergy ID is required"),
})

export const confirmNkaSchema = z.strictObject({
  patientId: z.uuid("Patient ID is required"),
})

export type AddAllergyInput = z.infer<typeof addAllergySchema>
export type UpdateAllergyInput = z.infer<typeof updateAllergySchema>
export type RemoveAllergyInput = z.infer<typeof removeAllergySchema>
export type ConfirmNkaInput = z.infer<typeof confirmNkaSchema>
