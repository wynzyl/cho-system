import { z } from "zod"

// =============================================================================
// QUEUE ACTIONS
// =============================================================================

export const getDoctorQueueSchema = z.strictObject({})

export const getEncounterForConsultSchema = z.strictObject({
  encounterId: z.uuid("Invalid encounter ID"),
})

// =============================================================================
// CONSULTATION WORKFLOW
// =============================================================================

export const startConsultationSchema = z.strictObject({
  encounterId: z.uuid("Invalid encounter ID"),
})

export const saveConsultationSchema = z.strictObject({
  encounterId: z.uuid("Invalid encounter ID"),

  // Doctor's HPI refinement (extends triage screening)
  hpiDoctorNotes: z
    .object({
      character: z.string().max(100).optional().nullable(),
      location: z.string().max(200).optional().nullable(),
      radiation: z.string().max(200).optional().nullable(),
      aggravating: z.string().max(500).optional().nullable(),
      relieving: z.string().max(500).optional().nullable(),
      additionalNotes: z.string().max(2000).optional().nullable(),
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
          notes: z.string().max(500).optional().nullable(),
        })
        .optional()
        .nullable(),
      heent: z
        .object({
          findings: z.array(z.string()),
          notes: z.string().max(500).optional().nullable(),
        })
        .optional()
        .nullable(),
      chest: z
        .object({
          findings: z.array(z.string()),
          notes: z.string().max(500).optional().nullable(),
        })
        .optional()
        .nullable(),
      cardiovascular: z
        .object({
          findings: z.array(z.string()),
          notes: z.string().max(500).optional().nullable(),
        })
        .optional()
        .nullable(),
      abdomen: z
        .object({
          findings: z.array(z.string()),
          notes: z.string().max(500).optional().nullable(),
        })
        .optional()
        .nullable(),
      skin: z
        .object({
          findings: z.array(z.string()),
          notes: z.string().max(500).optional().nullable(),
        })
        .optional()
        .nullable(),
      extremities: z
        .object({
          findings: z.array(z.string()),
          notes: z.string().max(500).optional().nullable(),
        })
        .optional()
        .nullable(),
      neurologic: z
        .object({
          findings: z.array(z.string()),
          notes: z.string().max(500).optional().nullable(),
        })
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),

  // Clinical impression/assessment
  clinicalImpression: z.string().max(2000).optional().nullable(),

  // Procedures performed
  proceduresData: z
    .object({
      version: z.number().default(1),
      procedures: z.array(
        z.object({
          code: z.string(),
          name: z.string(),
          notes: z.string().max(500).optional().nullable(),
        })
      ),
    })
    .optional()
    .nullable(),

  // Advice and follow-up
  adviceData: z
    .object({
      version: z.number().default(1),
      instructions: z.array(z.string()),
      followUpDate: z.string().optional().nullable(),
      followUpNotes: z.string().max(500).optional().nullable(),
      referral: z.string().max(500).optional().nullable(),
    })
    .optional()
    .nullable(),
})

export const completeConsultationSchema = z.strictObject({
  encounterId: z.uuid("Invalid encounter ID"),
  // Next status after consultation
  nextStatus: z.enum(["FOR_LAB", "FOR_PHARMACY", "DONE"]).default("DONE"),
})

// =============================================================================
// DIAGNOSIS ACTIONS
// =============================================================================

export const addDiagnosisSchema = z.strictObject({
  encounterId: z.uuid("Invalid encounter ID"),
  text: z.string().min(1, "Diagnosis text is required").max(500),
  subcategoryId: z.uuid("Invalid subcategory ID").optional().nullable(),
})

export const removeDiagnosisSchema = z.strictObject({
  diagnosisId: z.uuid("Invalid diagnosis ID"),
})

// =============================================================================
// PRESCRIPTION ACTIONS
// =============================================================================

export const addPrescriptionSchema = z.strictObject({
  encounterId: z.uuid("Invalid encounter ID"),
  notes: z.string().max(500).optional().nullable(),
  items: z
    .array(
      z.object({
        medicineId: z.uuid().optional().nullable(),
        medicineName: z.string().min(1, "Medicine name is required").max(200),
        dosage: z.string().max(100).optional().nullable(),
        frequency: z.string().max(100).optional().nullable(),
        duration: z.string().max(100).optional().nullable(),
        quantity: z.number().int().min(1).max(1000).optional().nullable(),
        instructions: z.string().max(500).optional().nullable(),
      })
    )
    .min(1, "At least one item is required"),
})

// =============================================================================
// LAB ORDER ACTIONS
// =============================================================================

export const addLabOrderSchema = z.strictObject({
  encounterId: z.uuid("Invalid encounter ID"),
  items: z
    .array(
      z.object({
        testCode: z.string().max(50).optional().nullable(),
        testName: z.string().min(1, "Test name is required").max(200),
        notes: z.string().max(500).optional().nullable(),
      })
    )
    .min(1, "At least one test is required"),
})

// =============================================================================
// PATIENT HISTORY ACTIONS
// =============================================================================

export const getPatientHistorySchema = z.strictObject({
  patientId: z.uuid("Invalid patient ID"),
  limit: z.number().int().min(1).max(100).default(20),
})

export const getEncounterDetailsSchema = z.strictObject({
  encounterId: z.uuid("Invalid encounter ID"),
})

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type GetDoctorQueueInput = z.infer<typeof getDoctorQueueSchema>
export type GetEncounterForConsultInput = z.infer<typeof getEncounterForConsultSchema>
export type StartConsultationInput = z.infer<typeof startConsultationSchema>
export type SaveConsultationInput = z.infer<typeof saveConsultationSchema>
export type CompleteConsultationInput = z.infer<typeof completeConsultationSchema>
export type AddDiagnosisInput = z.infer<typeof addDiagnosisSchema>
export type RemoveDiagnosisInput = z.infer<typeof removeDiagnosisSchema>
export type AddPrescriptionInput = z.infer<typeof addPrescriptionSchema>
export type AddLabOrderInput = z.infer<typeof addLabOrderSchema>
export type GetPatientHistoryInput = z.infer<typeof getPatientHistorySchema>
export type GetEncounterDetailsInput = z.infer<typeof getEncounterDetailsSchema>
