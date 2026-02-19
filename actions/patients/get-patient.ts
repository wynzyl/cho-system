"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import type { ActionResult } from "@/lib/auth/types"
import { Patient, Encounter, EncounterStatus, Sex, Barangay } from "@prisma/client"

export type PatientWithEncounters = Patient & {
  barangay: Barangay | null
  encounters: {
    id: string
    occurredAt: Date
    status: EncounterStatus
    chiefComplaint: string | null
  }[]
}

export async function getPatientAction(
  patientId: string
): Promise<ActionResult<PatientWithEncounters>> {
  await requireRoleForAction(["REGISTRATION", "TRIAGE", "DOCTOR"])

  if (!patientId || typeof patientId !== "string") {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid patient ID",
      },
    }
  }

  const patient = await db.patient.findFirst({
    where: { id: patientId, deletedAt: null },
    include: {
      barangay: true,
      encounters: {
        where: { deletedAt: null },
        orderBy: { occurredAt: "desc" },
        take: 20,
        select: {
          id: true,
          occurredAt: true,
          status: true,
          chiefComplaint: true,
        },
      },
    },
  })

  if (!patient) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Patient not found",
      },
    }
  }

  return {
    ok: true,
    data: patient,
  }
}
