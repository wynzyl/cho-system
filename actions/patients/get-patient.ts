"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import type { ActionResult } from "@/lib/auth/types"
import { Patient, EncounterStatus, Barangay, PatientAllergy } from "@prisma/client"

export type TodayEncounter = {
  id: string
  status: EncounterStatus
  occurredAt: Date
} | null

export type PatientAllergyWithRecorder = PatientAllergy & {
  recordedBy: { id: string; name: string } | null
}

export type PatientWithEncounters = Patient & {
  barangay: Barangay | null
  encounters: {
    id: string
    occurredAt: Date
    status: EncounterStatus
    chiefComplaint: string | null
  }[]
  allergies: PatientAllergyWithRecorder[]
  allergyConfirmedBy: { id: string; name: string } | null
  todayEncounter: TodayEncounter
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
      allergyConfirmedBy: {
        select: { id: true, name: true },
      },
      allergies: {
        where: { deletedAt: null },
        orderBy: [{ status: "asc" }, { severity: "desc" }, { recordedAt: "desc" }],
        include: {
          recordedBy: {
            select: { id: true, name: true },
          },
        },
      },
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

  // Check for existing encounter today
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const todayEncounter = await db.encounter.findFirst({
    where: {
      patientId,
      occurredAt: { gte: startOfDay, lte: endOfDay },
      deletedAt: null,
    },
    select: { id: true, status: true, occurredAt: true },
  })

  return {
    ok: true,
    data: {
      ...patient,
      todayEncounter: todayEncounter ?? null,
    },
  }
}
