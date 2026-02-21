"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import type { ActionResult } from "@/lib/auth/types"
import type { Sex } from "@prisma/client"

export type UnclaimedEncounterItem = {
  id: string // encounter ID
  patientId: string
  patientCode: string
  patientName: string // "LastName, FirstName"
  age: number
  sex: Sex
  chiefComplaint: string | null
  occurredAt: string // ISO string
  triageRecord: {
    bpSystolic: number | null
    bpDiastolic: number | null
    heartRate: number | null
    temperatureC: number | null
  } | null
}

function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

export async function getUnclaimedEncountersAction(): Promise<
  ActionResult<{ encounters: UnclaimedEncounterItem[]; total: number }>
> {
  const session = await requireRoleForAction(["DOCTOR"])

  // Get start and end of today
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  // Fetch TRIAGED encounters with no doctor assigned at the user's facility
  const encounters = await db.encounter.findMany({
    where: {
      status: "TRIAGED",
      doctorId: null,
      facilityId: session.facilityId,
      occurredAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
      deletedAt: null,
      patient: {
        deletedAt: null,
      },
    },
    include: {
      patient: {
        select: {
          id: true,
          patientCode: true,
          firstName: true,
          lastName: true,
          birthDate: true,
          sex: true,
        },
      },
      triageRecord: {
        select: {
          bpSystolic: true,
          bpDiastolic: true,
          heartRate: true,
          temperatureC: true,
        },
      },
    },
    orderBy: {
      occurredAt: "asc", // FIFO queue
    },
  })

  const items: UnclaimedEncounterItem[] = encounters.map((encounter) => ({
    id: encounter.id,
    patientId: encounter.patient.id,
    patientCode: encounter.patient.patientCode,
    patientName: `${encounter.patient.lastName}, ${encounter.patient.firstName}`,
    age: calculateAge(encounter.patient.birthDate),
    sex: encounter.patient.sex,
    chiefComplaint: encounter.chiefComplaint,
    occurredAt: encounter.occurredAt.toISOString(),
    triageRecord: encounter.triageRecord
      ? {
          bpSystolic: encounter.triageRecord.bpSystolic,
          bpDiastolic: encounter.triageRecord.bpDiastolic,
          heartRate: encounter.triageRecord.heartRate,
          temperatureC: encounter.triageRecord.temperatureC
            ? Number(encounter.triageRecord.temperatureC)
            : null,
        }
      : null,
  }))

  return {
    ok: true,
    data: {
      encounters: items,
      total: items.length,
    },
  }
}
