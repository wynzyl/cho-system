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
  claimedById: string | null
  claimedAt: Date | null
  claimedByName: string | null
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

export interface DoctorQueueResponse {
  items: DoctorQueueItem[]
  currentUserId: string
}

export async function getDoctorQueueAction(): Promise<ActionResult<DoctorQueueResponse>> {
  const session = await requireRoleForAction(["DOCTOR"])

  // Get today's date range
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Fetch encounters that are ready for or in consultation
  // For IN_CONSULT, only show encounters assigned to current doctor (unless ADMIN)
  const isAdmin = session.role === "ADMIN"
  const encounters = await db.encounter.findMany({
    where: {
      facilityId: session.facilityId,
      deletedAt: null,
      patient: {
        deletedAt: null,
      },
      occurredAt: {
        gte: today,
        lt: tomorrow,
      },
      OR: [
        // WAIT_DOCTOR: Any doctor can see and start these
        { status: "WAIT_DOCTOR" },
        // IN_CONSULT: Only show if assigned to current doctor (or if ADMIN)
        {
          status: "IN_CONSULT",
          ...(isAdmin ? {} : { doctorId: session.userId }),
        },
      ],
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
      claimedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      { status: "asc" }, // IN_CONSULT first alphabetically (I < W), then WAIT_DOCTOR
      { occurredAt: "asc" }, // Then FIFO by arrival time
    ],
  })

  // Transform to match interface (handle Decimal types)
  const queueItems: DoctorQueueItem[] = encounters.map((enc) => ({
    id: enc.id,
    status: enc.status,
    occurredAt: enc.occurredAt,
    chiefComplaint: enc.chiefComplaint,
    consultStartedAt: enc.consultStartedAt,
    claimedById: enc.claimedById,
    claimedAt: enc.claimedAt,
    claimedByName: enc.claimedBy?.name ?? null,
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

  return {
    ok: true,
    data: {
      items: queueItems,
      currentUserId: session.userId,
    },
  }
}
