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

  // HPI Screening (triage captures basic elements)
  symptomOnset: z.string().max(100).optional().nullable(),
  symptomDuration: z.string().max(100).optional().nullable(),
  painSeverity: z.number().int().min(1).max(10).optional().nullable(),
  associatedSymptoms: z.array(z.string()).optional().nullable(),

  // Exposure Screening (CHO-specific)
  exposureFlags: z.array(z.string()).optional().nullable(),
  exposureNotes: z.string().max(1000).optional().nullable(),
})

// Patient background update (triage confirms/updates)
export const updatePatientBackgroundSchema = z.strictObject({
  patientId: z.uuid("Invalid patient ID"),

  // Lifestyle
  isSmoker: z.boolean().optional().nullable(),
  smokingPackYears: z.number().int().min(0).max(100).optional().nullable(),
  isAlcohol: z.boolean().optional().nullable(),
  pregnancyStatus: z.string().max(50).optional().nullable(),
  pregnancyWeeks: z.number().int().min(1).max(45).optional().nullable(),

  // Medical history (JSON)
  medicalHistoryData: z
    .object({
      version: z.number().default(1),
      conditions: z
        .array(
          z.object({
            code: z.string(),
            name: z.string(),
            diagnosedYear: z.number().optional().nullable(),
            isControlled: z.boolean().optional().nullable(),
            notes: z.string().optional().nullable(),
          })
        )
        .default([]),
      surgeries: z
        .array(
          z.object({
            name: z.string(),
            year: z.number().optional().nullable(),
            notes: z.string().optional().nullable(),
          })
        )
        .default([]),
      currentMedications: z
        .array(
          z.object({
            name: z.string(),
            dosage: z.string().optional().nullable(),
            frequency: z.string().optional().nullable(),
            purpose: z.string().optional().nullable(),
          })
        )
        .default([]),
      immunizations: z
        .array(
          z.object({
            name: z.string(),
            date: z.string().optional().nullable(),
            notes: z.string().optional().nullable(),
          })
        )
        .default([]),
    })
    .optional()
    .nullable(),

  // Family history (JSON)
  familyHistoryData: z
    .object({
      version: z.number().default(1),
      diabetes: z
        .object({
          present: z.boolean(),
          relation: z.string().optional().nullable(),
          notes: z.string().optional().nullable(),
        })
        .optional()
        .nullable(),
      hypertension: z
        .object({
          present: z.boolean(),
          relation: z.string().optional().nullable(),
          notes: z.string().optional().nullable(),
        })
        .optional()
        .nullable(),
      cancer: z
        .object({
          present: z.boolean(),
          relation: z.string().optional().nullable(),
          notes: z.string().optional().nullable(),
        })
        .optional()
        .nullable(),
      heartDisease: z
        .object({
          present: z.boolean(),
          relation: z.string().optional().nullable(),
          notes: z.string().optional().nullable(),
        })
        .optional()
        .nullable(),
      stroke: z
        .object({
          present: z.boolean(),
          relation: z.string().optional().nullable(),
          notes: z.string().optional().nullable(),
        })
        .optional()
        .nullable(),
      asthma: z
        .object({
          present: z.boolean(),
          relation: z.string().optional().nullable(),
          notes: z.string().optional().nullable(),
        })
        .optional()
        .nullable(),
      mentalHealth: z
        .object({
          present: z.boolean(),
          relation: z.string().optional().nullable(),
          notes: z.string().optional().nullable(),
        })
        .optional()
        .nullable(),
      other: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
})

export type GetTriageQueueInput = z.infer<typeof getTriageQueueSchema>
export type SubmitTriageInput = z.infer<typeof submitTriageSchema>
export type UpdatePatientBackgroundInput = z.infer<typeof updatePatientBackgroundSchema>
