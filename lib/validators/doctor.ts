import { z } from "zod"

// Claim an unclaimed encounter (TRIAGED → WAIT_DOCTOR)
export const claimEncounterSchema = z.object({
  encounterId: z.string().uuid("Invalid encounter ID"),
}).strict()

// Start consultation (WAIT_DOCTOR → IN_CONSULT)
export const startConsultSchema = z.object({
  encounterId: z.string().uuid("Invalid encounter ID"),
}).strict()

// Add diagnosis to encounter
export const addDiagnosisSchema = z.object({
  encounterId: z.string().uuid("Invalid encounter ID"),
  text: z.string().min(1, "Diagnosis text is required").max(1000, "Diagnosis text too long"),
  diagnosisCodeId: z.string().uuid("Invalid diagnosis code ID").optional().nullable(),
}).strict()

// Create prescription with items
export const createPrescriptionSchema = z.object({
  encounterId: z.string().uuid("Invalid encounter ID"),
  notes: z.string().max(2000, "Notes too long").optional().nullable(),
  items: z.array(z.object({
    medicineName: z.string().min(1, "Medicine name is required").max(200, "Medicine name too long"),
    dosage: z.string().max(100, "Dosage too long").optional().nullable(),
    frequency: z.string().max(100, "Frequency too long").optional().nullable(),
    duration: z.string().max(100, "Duration too long").optional().nullable(),
    quantity: z.number().int().min(1, "Quantity must be at least 1").optional().nullable(),
    instructions: z.string().max(500, "Instructions too long").optional().nullable(),
  })).min(1, "At least one prescription item is required"),
}).strict()

// Complete consultation (IN_CONSULT → FOR_PHARMACY/DONE)
export const completeConsultationSchema = z.object({
  encounterId: z.string().uuid("Invalid encounter ID"),
}).strict()

// Type exports
export type ClaimEncounterInput = z.infer<typeof claimEncounterSchema>
export type StartConsultInput = z.infer<typeof startConsultSchema>
export type AddDiagnosisInput = z.infer<typeof addDiagnosisSchema>
export type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>
export type CompleteConsultationInput = z.infer<typeof completeConsultationSchema>
