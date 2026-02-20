"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { generatePatientCode } from "@/lib/utils/patient-code"
import type { ActionResult } from "@/lib/auth/types"
import { z } from "zod"

const inputSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  birthDate: z.coerce.date({ message: "Birth date is required" }),
  sex: z.enum(["MALE", "FEMALE", "OTHER", "UNKNOWN"]).optional().default("UNKNOWN"),
  phone: z.string().max(20).optional(),
})

type CreatePatientAndEncounterInput = z.infer<typeof inputSchema>

export type CreatePatientAndEncounterResponse = {
  patientId: string
  encounterId: string
  patientCode: string
}

export async function createPatientAndEncounterAction(
  input: CreatePatientAndEncounterInput
): Promise<ActionResult<CreatePatientAndEncounterResponse>> {
  const session = await requireRoleForAction(["TRIAGE"])

  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string
      if (!fieldErrors[field]) {
        fieldErrors[field] = []
      }
      fieldErrors[field].push(issue.message)
    }
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        fieldErrors,
      },
    }
  }

  const data = parsed.data

  // Convert empty strings to null for optional fields
  const emptyToNull = (val: string | undefined | null) =>
    val?.trim() ? val.trim() : null

  const result = await db.$transaction(async (tx) => {
    const patientCode = await generatePatientCode(tx)

    const patient = await tx.patient.create({
      data: {
        patientCode,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        birthDate: data.birthDate,
        sex: data.sex,
        phone: emptyToNull(data.phone),
      },
    })

    const encounter = await tx.encounter.create({
      data: {
        patientId: patient.id,
        facilityId: session.facilityId,
        status: "WAIT_TRIAGE",
      },
    })

    // Create audit logs for both
    await tx.auditLog.createMany({
      data: [
        {
          userId: session.userId,
          userName: session.name,
          action: "CREATE",
          entity: "Patient",
          entityId: patient.id,
          metadata: { patientCode, source: "triage-quick-add" },
        },
        {
          userId: session.userId,
          userName: session.name,
          action: "CREATE",
          entity: "Encounter",
          entityId: encounter.id,
          metadata: {
            patientId: patient.id,
            patientCode,
            status: "WAIT_TRIAGE",
          },
        },
      ],
    })

    return { patient, encounter }
  })

  return {
    ok: true,
    data: {
      patientId: result.patient.id,
      encounterId: result.encounter.id,
      patientCode: result.patient.patientCode,
    },
  }
}
