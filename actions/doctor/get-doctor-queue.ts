"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { getDoctorQueueSchema, type GetDoctorQueueInput } from "@/lib/validators/doctor"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"
import type { EncounterStatus, AllergySeverity, PatientAllergyStatus } from "@prisma/client"

export interface DoctorQueueItem {
  id: string
  status: EncounterStatus
  occurredAt: Date
  chiefComplaint: string | null
  patient: {
    id: string
    patientCode: string
    firstName: string
    middleName: string | null
    lastName: string
    birthDate: Date
    sex: string
    allergyStatus: PatientAllergyStatus
  }
  triageRecord: {
    id: string
    bpSystolic: number | null
    bpDiastolic: number | null
    heartRate: number | null
    temperatureC: number | null
    symptomOnset: string | null
    symptomDuration: string | null
    painSeverity: number | null
    associatedSymptoms: string[]
    exposureFlags: string[]
    recordedAt: Date
  } | null
  allergies: {
    id: string
    allergen: string
    severity: AllergySeverity
  }[]
  doctorId: string | null
  consultStartedAt: Date | null
}

export async function getDoctorQueueAction(
  input: GetDoctorQueueInput = {}
): Promise<ActionResult<DoctorQueueItem[]>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const validation = validateInput(getDoctorQueueSchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  // Default to today
  const targetDate = data.date ?? new Date()
  const startOfDay = new Date(targetDate)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(targetDate)
  endOfDay.setHours(23, 59, 59, 999)

  // Build status filter
  const statusFilter: EncounterStatus[] = data.status
    ? [data.status]
    : ["TRIAGED", "WAIT_DOCTOR", "IN_CONSULT"]

  const encounters = await db.encounter.findMany({
    where: {
      facilityId: session.facilityId,
      status: { in: statusFilter },
      occurredAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
      deletedAt: null,
    },
    include: {
      patient: {
        select: {
          id: true,
          patientCode: true,
          firstName: true,
          middleName: true,
          lastName: true,
          birthDate: true,
          sex: true,
          allergyStatus: true,
          allergies: {
            where: {
              status: "ACTIVE",
              deletedAt: null,
            },
            select: {
              id: true,
              allergen: true,
              severity: true,
            },
          },
        },
      },
      triageRecord: {
        select: {
          id: true,
          bpSystolic: true,
          bpDiastolic: true,
          heartRate: true,
          temperatureC: true,
          symptomOnset: true,
          symptomDuration: true,
          painSeverity: true,
          associatedSymptoms: true,
          exposureFlags: true,
          recordedAt: true,
        },
      },
    },
    orderBy: [
      // Sort by occurredAt (FIFO queue)
      { occurredAt: "asc" },
    ],
  })

  // Transform to queue items
  const queueItems: DoctorQueueItem[] = encounters.map((enc) => ({
    id: enc.id,
    status: enc.status,
    occurredAt: enc.occurredAt,
    chiefComplaint: enc.chiefComplaint,
    patient: {
      id: enc.patient.id,
      patientCode: enc.patient.patientCode,
      firstName: enc.patient.firstName,
      middleName: enc.patient.middleName,
      lastName: enc.patient.lastName,
      birthDate: enc.patient.birthDate,
      sex: enc.patient.sex,
      allergyStatus: enc.patient.allergyStatus,
    },
    triageRecord: enc.triageRecord
      ? {
          id: enc.triageRecord.id,
          bpSystolic: enc.triageRecord.bpSystolic,
          bpDiastolic: enc.triageRecord.bpDiastolic,
          heartRate: enc.triageRecord.heartRate,
          temperatureC: enc.triageRecord.temperatureC
            ? Number(enc.triageRecord.temperatureC)
            : null,
          symptomOnset: enc.triageRecord.symptomOnset,
          symptomDuration: enc.triageRecord.symptomDuration,
          painSeverity: enc.triageRecord.painSeverity,
          associatedSymptoms: enc.triageRecord.associatedSymptoms,
          exposureFlags: enc.triageRecord.exposureFlags,
          recordedAt: enc.triageRecord.recordedAt,
        }
      : null,
    allergies: enc.patient.allergies,
    doctorId: enc.doctorId,
    consultStartedAt: enc.consultStartedAt,
  }))

  return {
    ok: true,
    data: queueItems,
  }
}
