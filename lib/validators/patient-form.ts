import { z } from "zod"
import {
  SEX_VALUES,
  CIVIL_STATUS_VALUES,
  RELIGION_VALUES,
  EDUCATION_VALUES,
  BLOOD_TYPE_VALUES,
  PHILHEALTH_MEMBERSHIP_TYPE_VALUES,
} from "@/lib/constants/enums"
import {
  validateEligibilityDates,
  ELIGIBILITY_DATE_ERROR,
  PHILHEALTH_NUMBER_REGEX,
  PHILHEALTH_NUMBER_ERROR,
} from "./refinements"

/**
 * Client-side patient form schema
 * Uses strings for date inputs (converted to Date on submit)
 */
export const patientFormSchema = z
  .object({
    firstName: z.string().min(1, "First name is required").max(100),
    middleName: z.string().max(100).optional(),
    lastName: z.string().min(1, "Last name is required").max(100),
    birthDate: z.string().min(1, "Birth date is required"),
    sex: z.enum(SEX_VALUES, { message: "Sex is required" }),
    civilStatus: z.enum(CIVIL_STATUS_VALUES, { message: "Civil status is required" }),
    religion: z.enum(RELIGION_VALUES),
    education: z.enum(EDUCATION_VALUES),
    bloodType: z.enum(BLOOD_TYPE_VALUES),
    occupation: z.string().max(100).optional(),
    phone: z.string().min(1, "Phone number is required").max(20),
    philhealthNo: z
      .string()
      .regex(PHILHEALTH_NUMBER_REGEX, PHILHEALTH_NUMBER_ERROR)
      .optional()
      .or(z.literal("")),
    philhealthMembershipType: z.enum(PHILHEALTH_MEMBERSHIP_TYPE_VALUES).optional(),
    philhealthEligibilityStart: z.string().optional(),
    philhealthEligibilityEnd: z.string().optional(),
    philhealthPrincipalPin: z
      .string()
      .regex(PHILHEALTH_NUMBER_REGEX, PHILHEALTH_NUMBER_ERROR)
      .optional()
      .or(z.literal("")),
    addressLine: z.string().max(255).optional(),
    barangayId: z.string().uuid("Barangay is required"),
    notes: z.string().max(1000).optional(),
  })
  .refine(validateEligibilityDates, ELIGIBILITY_DATE_ERROR)

export type PatientFormData = z.infer<typeof patientFormSchema>
