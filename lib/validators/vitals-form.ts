import { z } from "zod"

/**
 * Client-side vitals form schema for triage
 * Uses strings for form inputs (converted to numbers on submit)
 */
export const vitalsFormSchema = z.object({
  // Vital Signs
  bpSystolic: z
    .string()
    .min(1, "Systolic BP is required")
    .refine((val) => {
      const num = parseInt(val, 10)
      return !isNaN(num) && num >= 50 && num <= 300
    }, "Must be between 50-300"),
  bpDiastolic: z
    .string()
    .min(1, "Diastolic BP is required")
    .refine((val) => {
      const num = parseInt(val, 10)
      return !isNaN(num) && num >= 20 && num <= 200
    }, "Must be between 20-200"),
  heartRate: z
    .string()
    .min(1, "Heart rate is required")
    .refine((val) => {
      const num = parseInt(val, 10)
      return !isNaN(num) && num >= 20 && num <= 250
    }, "Must be between 20-250"),
  temperatureC: z
    .string()
    .min(1, "Temperature is required")
    .refine((val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num >= 30 && num <= 45
    }, "Must be between 30-45°C"),
  respiratoryRate: z
    .string()
    .min(1, "Respiratory rate is required")
    .refine((val) => {
      const num = parseInt(val, 10)
      return !isNaN(num) && num >= 5 && num <= 60
    }, "Must be between 5-60"),
  spo2: z
    .string()
    .min(1, "Oxygen saturation is required")
    .refine((val) => {
      const num = parseInt(val, 10)
      return !isNaN(num) && num >= 50 && num <= 100
    }, "Must be between 50-100%"),
  weightKg: z
    .string()
    .min(1, "Weight is required")
    .refine((val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num >= 0.5 && num <= 500
    }, "Must be between 0.5-500 kg"),
  heightCm: z
    .string()
    .min(1, "Height is required")
    .refine((val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num >= 20 && num <= 300
    }, "Must be between 20-300 cm"),

  // Chief Complaint & Notes
  chiefComplaint: z
    .string()
    .min(1, "Chief complaint is required")
    .max(500, "Maximum 500 characters"),
  triageNotes: z.string().max(2000, "Maximum 2000 characters").optional(),

  // HPI Screening
  symptomOnset: z.string().optional(),
  symptomDuration: z.string().optional(),
  painSeverity: z.number().int().min(0).max(10).optional(),
  associatedSymptoms: z.array(z.string()).optional(),

  // Exposure Screening (CHO-specific)
  exposureFlags: z.array(z.string()).optional(),
  exposureNotes: z.string().max(1000, "Maximum 1000 characters").optional(),
})

export type VitalsFormData = z.infer<typeof vitalsFormSchema>
