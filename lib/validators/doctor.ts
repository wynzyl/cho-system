import { z } from "zod"

// Get doctor queue
export const getDoctorQueueSchema = z.strictObject({
  // Optional filters
  status: z
    .enum(["TRIAGED", "WAIT_DOCTOR", "IN_CONSULT", "FOR_LAB", "FOR_PHARMACY"])
    .optional(),
  date: z.coerce.date().optional(), // Defaults to today
})

// Get single encounter for consultation
export const getEncounterForConsultSchema = z.strictObject({
  encounterId: z.uuid("Invalid encounter ID"),
})

// Start consultation (claim encounter as doctor)
export const startConsultationSchema = z.strictObject({
  encounterId: z.uuid("Invalid encounter ID"),
})

// Save consultation (auto-save or manual save)
export const saveConsultationSchema = z.strictObject({
  encounterId: z.uuid("Invalid encounter ID"),

  // Doctor's HPI refinement (extends triage screening)
  hpiDoctorNotes: z
    .object({
      version: z.number().default(1),
      character: z.string().max(100).optional(),
      location: z.string().max(200).optional(),
      radiation: z.string().max(200).optional(),
      aggravating: z.array(z.string().max(100)).optional(),
      relieving: z.array(z.string().max(100)).optional(),
      timing: z.string().max(200).optional(),
      previousEpisodes: z.string().max(500).optional(),
      treatmentsTried: z.string().max(500).optional(),
      additionalNotes: z.string().max(2000).optional(),
    })
    .optional()
    .nullable(),

  // Physical Examination
  physicalExamData: z
    .object({
      version: z.number().default(1),
      general: z
        .object({
          findings: z.array(z.string()),
          notes: z.string().optional(),
          isNormal: z.boolean().optional(),
        })
        .optional(),
      heent: z
        .object({
          findings: z.array(z.string()),
          notes: z.string().optional(),
          isNormal: z.boolean().optional(),
        })
        .optional(),
      chest: z
        .object({
          findings: z.array(z.string()),
          notes: z.string().optional(),
          isNormal: z.boolean().optional(),
        })
        .optional(),
      cardiovascular: z
        .object({
          findings: z.array(z.string()),
          notes: z.string().optional(),
          isNormal: z.boolean().optional(),
        })
        .optional(),
      abdomen: z
        .object({
          findings: z.array(z.string()),
          notes: z.string().optional(),
          isNormal: z.boolean().optional(),
        })
        .optional(),
      skin: z
        .object({
          findings: z.array(z.string()),
          notes: z.string().optional(),
          isNormal: z.boolean().optional(),
        })
        .optional(),
      extremities: z
        .object({
          findings: z.array(z.string()),
          notes: z.string().optional(),
          isNormal: z.boolean().optional(),
        })
        .optional(),
      neurologic: z
        .object({
          findings: z.array(z.string()),
          notes: z.string().optional(),
          isNormal: z.boolean().optional(),
        })
        .optional(),
    })
    .optional()
    .nullable(),

  // Clinical Impression
  clinicalImpression: z.string().max(2000).optional().nullable(),

  // Procedures performed
  proceduresData: z
    .object({
      version: z.number().default(1),
      procedures: z
        .array(
          z.object({
            code: z.string(),
            name: z.string(),
            notes: z.string().optional(),
            performedAt: z.string().optional(),
          })
        )
        .default([]),
    })
    .optional()
    .nullable(),

  // Advice and follow-up
  adviceData: z
    .object({
      version: z.number().default(1),
      instructions: z.array(z.string()).default([]),
      customInstructions: z.string().optional(),
      followUpDate: z.string().optional(),
      followUpNotes: z.string().optional(),
      referral: z
        .object({
          facility: z.string().optional(),
          department: z.string().optional(),
          reason: z.string().optional(),
          urgency: z.enum(["routine", "urgent", "emergency"]).optional(),
        })
        .optional(),
    })
    .optional()
    .nullable(),
})

// Complete consultation
export const completeConsultationSchema = z.strictObject({
  encounterId: z.uuid("Invalid encounter ID"),
  // Include all save fields
  hpiDoctorNotes: saveConsultationSchema.shape.hpiDoctorNotes,
  physicalExamData: saveConsultationSchema.shape.physicalExamData,
  clinicalImpression: saveConsultationSchema.shape.clinicalImpression,
  proceduresData: saveConsultationSchema.shape.proceduresData,
  adviceData: saveConsultationSchema.shape.adviceData,
  // Next status
  nextStatus: z.enum(["FOR_LAB", "FOR_PHARMACY", "DONE"]),
})

// Add diagnosis
export const addDiagnosisSchema = z.strictObject({
  encounterId: z.uuid("Invalid encounter ID"),
  text: z.string().min(1).max(500),
  subcategoryId: z.uuid().optional().nullable(), // Link to taxonomy
})

// Remove diagnosis
export const removeDiagnosisSchema = z.strictObject({
  diagnosisId: z.uuid("Invalid diagnosis ID"),
})

// Add prescription
export const addPrescriptionSchema = z.strictObject({
  encounterId: z.uuid("Invalid encounter ID"),
  notes: z.string().max(500).optional().nullable(),
  items: z
    .array(
      z.object({
        medicineId: z.uuid().optional().nullable(),
        medicineName: z.string().min(1).max(200),
        dosage: z.string().max(100).optional().nullable(),
        frequency: z.string().max(100).optional().nullable(),
        duration: z.string().max(100).optional().nullable(),
        quantity: z.number().int().min(1).max(9999).optional().nullable(),
        instructions: z.string().max(500).optional().nullable(),
      })
    )
    .min(1)
    .max(20),
})

// Add lab order
export const addLabOrderSchema = z.strictObject({
  encounterId: z.uuid("Invalid encounter ID"),
  items: z
    .array(
      z.object({
        testCode: z.string().max(50).optional().nullable(),
        testName: z.string().min(1).max(200),
        notes: z.string().max(500).optional().nullable(),
      })
    )
    .min(1)
    .max(20),
})

// Types
export type GetDoctorQueueInput = z.infer<typeof getDoctorQueueSchema>
export type GetEncounterForConsultInput = z.infer<typeof getEncounterForConsultSchema>
export type StartConsultationInput = z.infer<typeof startConsultationSchema>
export type SaveConsultationInput = z.infer<typeof saveConsultationSchema>
export type CompleteConsultationInput = z.infer<typeof completeConsultationSchema>
export type AddDiagnosisInput = z.infer<typeof addDiagnosisSchema>
export type RemoveDiagnosisInput = z.infer<typeof removeDiagnosisSchema>
export type AddPrescriptionInput = z.infer<typeof addPrescriptionSchema>
export type AddLabOrderInput = z.infer<typeof addLabOrderSchema>
