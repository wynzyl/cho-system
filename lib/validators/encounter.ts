import { z } from "zod"

export const createEncounterSchema = z.object({
  patientId: z.string().uuid("Invalid patient ID"),
}).strict()

export type CreateEncounterInput = z.infer<typeof createEncounterSchema>
