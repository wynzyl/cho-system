import { z } from "zod"

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
    sex: z.enum(["MALE", "FEMALE", "OTHER"], { message: "Sex is required" }),
    civilStatus: z.enum(["SINGLE", "MARRIED", "WIDOWED", "SEPARATED", "ANNULLED"], {
      message: "Civil status is required",
    }),
    religion: z.enum([
      "ROMAN_CATHOLIC",
      "PROTESTANT",
      "IGLESIA_NI_CRISTO",
      "ISLAM",
      "BUDDHIST",
      "OTHER",
      "NONE",
      "UNKNOWN",
    ]),
    education: z.enum([
      "NO_FORMAL",
      "ELEMENTARY",
      "JUNIOR_HIGH",
      "SENIOR_HIGH",
      "VOCATIONAL",
      "COLLEGE",
      "POSTGRADUATE",
      "UNKNOWN",
    ]),
    bloodType: z.enum([
      "A_POSITIVE",
      "A_NEGATIVE",
      "B_POSITIVE",
      "B_NEGATIVE",
      "AB_POSITIVE",
      "AB_NEGATIVE",
      "O_POSITIVE",
      "O_NEGATIVE",
      "UNKNOWN",
    ]),
    occupation: z.string().max(100).optional(),
    phone: z.string().min(1, "Phone number is required").max(20),
    philhealthNo: z
      .string()
      .regex(/^\d{12}$/, "Must be exactly 12 digits")
      .optional()
      .or(z.literal("")),
    philhealthMembershipType: z
      .enum(["EMPLOYED", "SELF_EMPLOYED", "INDIGENT", "OFW", "LIFETIME", "DEPENDENT", "OTHER"])
      .optional(),
    philhealthEligibilityStart: z.string().optional(),
    philhealthEligibilityEnd: z.string().optional(),
    philhealthPrincipalPin: z
      .string()
      .regex(/^\d{12}$/, "Must be exactly 12 digits")
      .optional()
      .or(z.literal("")),
    addressLine: z.string().max(255).optional(),
    barangayId: z.string().uuid("Barangay is required"),
    notes: z.string().max(1000).optional(),
  })
  .refine(
    (data) => {
      if (data.philhealthEligibilityStart && data.philhealthEligibilityEnd) {
        return new Date(data.philhealthEligibilityEnd) > new Date(data.philhealthEligibilityStart)
      }
      return true
    },
    {
      message: "End date must be after start date",
      path: ["philhealthEligibilityEnd"],
    }
  )

export type PatientFormData = z.infer<typeof patientFormSchema>
