import { z } from "zod"

export const getTriageQueueSchema = z.object({
  query: z.string().max(100).optional(),
}).strict()

export const submitTriageSchema = z.object({
  encounterId: z.string().uuid("Invalid encounter ID"),

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
}).strict()

export type GetTriageQueueInput = z.infer<typeof getTriageQueueSchema>
export type SubmitTriageInput = z.infer<typeof submitTriageSchema>
