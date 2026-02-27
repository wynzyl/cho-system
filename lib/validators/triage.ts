import { z } from "zod"

// Note: Queue filtering happens client-side since it's a small daily list
export const getTriageQueueSchema = z.strictObject({})

export const submitTriageSchema = z.strictObject({
  encounterId: z.uuid("Invalid encounter ID"),

  // Vitals (all optional, stored in metric)
  bpSystolic: z.number().int().min(50).max(300).optional().nullable(),
  bpDiastolic: z.number().int().min(20).max(200).optional().nullable(),
  heartRate: z.number().int().min(20).max(250).optional().nullable(),
  respiratoryRate: z.number().int().min(5).max(60).optional().nullable(),
  temperatureC: z.number().min(30).max(45).optional().nullable(),
  spo2: z.number().int().min(50).max(100).optional().nullable(),
  weightKg: z.number().min(0.5).max(500).optional().nullable(),
  heightCm: z.number().min(20).max(300).optional().nullable(),

  // Encounter fields
  chiefComplaint: z.string().max(500).optional().nullable(),
  triageNotes: z.string().max(2000).optional().nullable(),

  // HPI Screening (NEW - triage captures basic elements)
  symptomOnset: z.string().max(100).optional().nullable(),
  symptomDuration: z.string().max(100).optional().nullable(),
  painSeverity: z.number().int().min(1).max(10).optional().nullable(),
  associatedSymptoms: z.array(z.string().max(50)).max(20).optional().nullable(),

  // Exposure Screening (NEW - CHO-specific alerts)
  exposureFlags: z.array(z.string().max(50)).max(10).optional().nullable(),
  exposureNotes: z.string().max(500).optional().nullable(),
})

// Schema for updating patient background (lifestyle + medical history)
export const updatePatientBackgroundSchema = z.strictObject({
  patientId: z.uuid("Invalid patient ID"),

  // Lifestyle
  isSmoker: z.boolean().optional().nullable(),
  smokingPackYears: z.number().int().min(0).max(200).optional().nullable(),
  isAlcohol: z.boolean().optional().nullable(),
  pregnancyStatus: z.string().max(50).optional().nullable(),
  pregnancyWeeks: z.number().int().min(1).max(45).optional().nullable(),

  // Medical History JSON
  medicalHistoryData: z
    .object({
      version: z.number().default(1),
      conditions: z
        .array(
          z.object({
            code: z.string(),
            name: z.string(),
            diagnosedYear: z.number().optional(),
            notes: z.string().optional(),
            isActive: z.boolean().default(true),
          })
        )
        .optional()
        .default([]),
      surgeries: z
        .array(
          z.object({
            procedure: z.string(),
            year: z.number().optional(),
            notes: z.string().optional(),
          })
        )
        .optional()
        .default([]),
      currentMedications: z
        .array(
          z.object({
            name: z.string(),
            dosage: z.string().optional(),
            frequency: z.string().optional(),
            forCondition: z.string().optional(),
          })
        )
        .optional()
        .default([]),
      immunizations: z
        .array(
          z.object({
            vaccine: z.string(),
            dateGiven: z.string().optional(),
            notes: z.string().optional(),
          })
        )
        .optional()
        .default([]),
    })
    .optional()
    .nullable(),

  // Family History JSON
  familyHistoryData: z
    .object({
      version: z.number().default(1),
      diabetes: z
        .object({
          present: z.boolean(),
          relation: z.string().optional(),
          notes: z.string().optional(),
        })
        .optional()
        .default({ present: false }),
      hypertension: z
        .object({
          present: z.boolean(),
          relation: z.string().optional(),
          notes: z.string().optional(),
        })
        .optional()
        .default({ present: false }),
      cancer: z
        .object({
          present: z.boolean(),
          relation: z.string().optional(),
          notes: z.string().optional(),
        })
        .optional()
        .default({ present: false }),
      heartDisease: z
        .object({
          present: z.boolean(),
          relation: z.string().optional(),
          notes: z.string().optional(),
        })
        .optional()
        .default({ present: false }),
      stroke: z
        .object({
          present: z.boolean(),
          relation: z.string().optional(),
          notes: z.string().optional(),
        })
        .optional()
        .default({ present: false }),
      asthma: z
        .object({
          present: z.boolean(),
          relation: z.string().optional(),
          notes: z.string().optional(),
        })
        .optional()
        .default({ present: false }),
      mentalIllness: z
        .object({
          present: z.boolean(),
          relation: z.string().optional(),
          notes: z.string().optional(),
        })
        .optional()
        .default({ present: false }),
      kidneyDisease: z
        .object({
          present: z.boolean(),
          relation: z.string().optional(),
          notes: z.string().optional(),
        })
        .optional()
        .default({ present: false }),
      other: z.string().optional(),
    })
    .optional()
    .nullable(),

  // Social History JSON
  socialHistoryData: z
    .object({
      version: z.number().default(1),
      exposureHistory: z
        .array(
          z.object({
            type: z.string(),
            date: z.string().optional(),
            details: z.string().optional(),
          })
        )
        .optional()
        .default([]),
      occupationalHazards: z.string().optional(),
      livingConditions: z.string().optional(),
      other: z.string().optional(),
    })
    .optional()
    .nullable(),
})

export type GetTriageQueueInput = z.infer<typeof getTriageQueueSchema>
export type SubmitTriageInput = z.infer<typeof submitTriageSchema>
export type UpdatePatientBackgroundInput = z.infer<typeof updatePatientBackgroundSchema>
