"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { getTriageQueueSchema, type GetTriageQueueInput } from "@/lib/validators/triage"
import type { ActionResult } from "@/lib/auth/types"
import type { Sex } from "@prisma/client"

export type TriageQueueItem = {
  id: string // encounter ID
  patientId: string
  patientCode: string
  patientName: string // "LastName, FirstName"
  age: number
  sex: Sex
  chiefComplaint: string | null
  occurredAt: Date
  priority: "HIGH" | "MEDIUM" | "LOW"
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

function determinePriority(chiefComplaint: string | null): "HIGH" | "MEDIUM" | "LOW" {
  if (!chiefComplaint) return "MEDIUM"

  const complaint = chiefComplaint.toLowerCase()
  const highPriorityKeywords = [
    "chest pain", "difficulty breathing", "shortness of breath",
    "severe", "unconscious", "bleeding", "stroke", "heart attack",
    "seizure", "trauma", "emergency"
  ]

  const lowPriorityKeywords = [
    "follow up", "checkup", "routine", "mild", "minor"
  ]

  if (highPriorityKeywords.some(keyword => complaint.includes(keyword))) {
    return "HIGH"
  }

  if (lowPriorityKeywords.some(keyword => complaint.includes(keyword))) {
    return "LOW"
  }

  return "MEDIUM"
}

export async function getTriageQueueAction(
  input?: GetTriageQueueInput
): Promise<ActionResult<{ encounters: TriageQueueItem[]; total: number }>> {
  const session = await requireRoleForAction(["TRIAGE"])

  const parsed = getTriageQueueSchema.safeParse(input ?? {})
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
      },
    }
  }

  // Get start and end of today
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)

  const encounters = await db.encounter.findMany({
    where: {
      status: "WAIT_TRIAGE",
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
    },
    orderBy: {
      occurredAt: "asc", // FIFO queue
    },
  })

  const queueItems: TriageQueueItem[] = encounters.map((encounter) => ({
    id: encounter.id,
    patientId: encounter.patient.id,
    patientCode: encounter.patient.patientCode,
    patientName: `${encounter.patient.lastName}, ${encounter.patient.firstName}`,
    age: calculateAge(encounter.patient.birthDate),
    sex: encounter.patient.sex,
    chiefComplaint: encounter.chiefComplaint,
    occurredAt: encounter.occurredAt,
    priority: determinePriority(encounter.chiefComplaint),
  }))

  return {
    ok: true,
    data: {
      encounters: queueItems,
      total: queueItems.length,
    },
  }
}
