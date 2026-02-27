"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import type { ActionResult } from "@/lib/auth/types"

export interface DoctorQueueItem {
  id: string
  status: string
  occurredAt: Date
  chiefComplaint: string | null
  consultStartedAt: Date | null
  patient: {
    id: string
    patientCode: string
    firstName: string
    middleName: string | null
    lastName: string
    birthDate: Date
    sex: string
    allergyStatus: string
  }
  triageRecord: {
    bpSystolic: number | null
    bpDiastolic: number | null
    heartRate: number | null
    temperatureC: number | null
    symptomOnset: string | null
    symptomDuration: string | null
    painSeverity: number | null
    associatedSymptoms: string[]
    exposureFlags: string[]
  } | null
  doctor: {
    id: string
    name: string
  } | null
}

export async function getDoctorQueueAction(): Promise<ActionResult<DoctorQueueItem[]>> {
  const session = await requireRoleForAction(["DOCTOR"])

  // Get today's date range
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Fetch encounters that are ready for or in consultation
  const encounters = await db.encounter.findMany({
    where: {
      facilityId: session.facilityId,
      deletedAt: null,
      occurredAt: {
        gte: today,
        lt: tomorrow,
      },
      status: {
        in: ["TRIAGED", "IN_CONSULT"],
      },
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
        },
      },
      triageRecord: {
        select: {
          bpSystolic: true,
          bpDiastolic: true,
          heartRate: true,
          temperatureC: true,
          symptomOnset: true,
          symptomDuration: true,
          painSeverity: true,
          associatedSymptoms: true,
          exposureFlags: true,
        },
      },
      doctor: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      { status: "asc" }, // IN_CONSULT first (doctor's active cases)
      { occurredAt: "asc" }, // Then FIFO
    ],
  })

  // Transform to match interface (handle Decimal types)
  const queueItems: DoctorQueueItem[] = encounters.map((enc) => ({
    id: enc.id,
    status: enc.status,
    occurredAt: enc.occurredAt,
    chiefComplaint: enc.chiefComplaint,
    consultStartedAt: enc.consultStartedAt,
    patient: enc.patient,
    triageRecord: enc.triageRecord
      ? {
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
        }
      : null,
    doctor: enc.doctor,
  }))

  return { ok: true, data: queueItems }
}
