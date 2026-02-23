import { z } from "zod"

export const createEncounterSchema = z.strictObject({
  patientId: z.uuid("Invalid patient ID"),
})

export type CreateEncounterInput = z.infer<typeof createEncounterSchema>
