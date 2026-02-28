"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { getPatientHistorySchema } from "@/lib/validators/doctor"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"
import type {
  PatientHistoryResult,
  HistoricalEncounterSummary,
  AggregatedDiagnosis,
  AggregatedMedication,
  VitalsRecord,
} from "@/lib/types/patient-history"

export async function getPatientHistoryAction(input: {
  patientId: string
  limit?: number
}): Promise<ActionResult<PatientHistoryResult>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const validation = validateInput(getPatientHistorySchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  // Verify patient exists and is accessible
  const patient = await db.patient.findFirst({
    where: {
      id: data.patientId,
      deletedAt: null,
    },
    select: {
      id: true,
      patientCode: true,
      firstName: true,
      middleName: true,
      lastName: true,
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

  // Fetch encounters with summaries (limited, ordered by most recent)
  const encounters = await db.encounter.findMany({
    where: {
      patientId: data.patientId,
      deletedAt: null,
      // Only show completed encounters in history (not active ones)
      status: {
        in: ["DONE", "FOR_LAB", "FOR_PHARMACY", "CANCELLED"],
      },
    },
    orderBy: { occurredAt: "desc" },
    take: data.limit,
    include: {
      facility: {
        select: { name: true },
      },
      doctor: {
        select: { name: true },
      },
      triageBy: {
        select: { name: true },
      },
      diagnoses: {
        where: { deletedAt: null },
        include: {
          subcategory: {
            include: {
              icdMappings: {
                where: { deletedAt: null, isDefault: true },
                take: 1,
              },
            },
          },
        },
      },
      prescriptions: {
        where: { deletedAt: null },
        include: {
          items: {
            where: { deletedAt: null },
          },
        },
      },
      labOrders: {
        where: { deletedAt: null },
      },
      triageRecord: {
        where: { deletedAt: null },
        select: {
          bpSystolic: true,
          bpDiastolic: true,
          heartRate: true,
          respiratoryRate: true,
          temperatureC: true,
          spo2: true,
          weightKg: true,
          heightCm: true,
        },
      },
    },
  })

  // Transform encounters to summary format
  const encounterSummaries: HistoricalEncounterSummary[] = encounters.map(
    (enc) => ({
      id: enc.id,
      occurredAt: enc.occurredAt,
      status: enc.status,
      chiefComplaint: enc.chiefComplaint,
      facilityName: enc.facility.name,
      doctorName: enc.doctor?.name ?? null,
      triageByName: enc.triageBy?.name ?? null,
      diagnoses: enc.diagnoses.map((d) => ({
        id: d.id,
        text: d.text,
        icdCode: d.subcategory?.icdMappings[0]?.icd10Code ?? null,
      })),
      prescriptionCount: enc.prescriptions.length,
      labOrderCount: enc.labOrders.length,
    })
  )

  // Aggregate diagnoses across all encounters
  const diagnosisMap = new Map<
    string,
    {
      text: string
      icdCode: string | null
      subcategoryCode: string | null
      subcategoryName: string | null
      count: number
      firstOccurrence: Date
      lastOccurrence: Date
      encounterIds: string[]
    }
  >()

  for (const enc of encounters) {
    for (const d of enc.diagnoses) {
      const key = d.text.toLowerCase().trim()
      const existing = diagnosisMap.get(key)
      const icdCode = d.subcategory?.icdMappings[0]?.icd10Code ?? null

      if (existing) {
        existing.count++
        if (enc.occurredAt < existing.firstOccurrence) {
          existing.firstOccurrence = enc.occurredAt
        }
        if (enc.occurredAt > existing.lastOccurrence) {
          existing.lastOccurrence = enc.occurredAt
        }
        existing.encounterIds.push(enc.id)
      } else {
        diagnosisMap.set(key, {
          text: d.text,
          icdCode,
          subcategoryCode: d.subcategory?.code ?? null,
          subcategoryName: d.subcategory?.name ?? null,
          count: 1,
          firstOccurrence: enc.occurredAt,
          lastOccurrence: enc.occurredAt,
          encounterIds: [enc.id],
        })
      }
    }
  }

  const aggregatedDiagnoses: AggregatedDiagnosis[] = Array.from(
    diagnosisMap.values()
  ).sort((a, b) => b.count - a.count)

  // Aggregate medications across all encounters
  const medicationMap = new Map<
    string,
    {
      medicineName: string
      prescriptionCount: number
      lastPrescribed: Date
      dosages: Set<string>
      encounterIds: string[]
    }
  >()

  for (const enc of encounters) {
    for (const rx of enc.prescriptions) {
      for (const item of rx.items) {
        const key = item.medicineName.toLowerCase().trim()
        const existing = medicationMap.get(key)

        if (existing) {
          existing.prescriptionCount++
          if (enc.occurredAt > existing.lastPrescribed) {
            existing.lastPrescribed = enc.occurredAt
          }
          if (item.dosage) {
            existing.dosages.add(item.dosage)
          }
          if (!existing.encounterIds.includes(enc.id)) {
            existing.encounterIds.push(enc.id)
          }
        } else {
          medicationMap.set(key, {
            medicineName: item.medicineName,
            prescriptionCount: 1,
            lastPrescribed: enc.occurredAt,
            dosages: item.dosage ? new Set([item.dosage]) : new Set(),
            encounterIds: [enc.id],
          })
        }
      }
    }
  }

  const aggregatedMedications: AggregatedMedication[] = Array.from(
    medicationMap.values()
  )
    .map((m) => ({
      medicineName: m.medicineName,
      prescriptionCount: m.prescriptionCount,
      lastPrescribed: m.lastPrescribed,
      dosages: Array.from(m.dosages),
      encounterIds: m.encounterIds,
    }))
    .sort((a, b) => b.prescriptionCount - a.prescriptionCount)

  // Extract vitals history for trending
  const vitalsHistory: VitalsRecord[] = encounters
    .filter((enc) => enc.triageRecord)
    .map((enc) => ({
      encounterId: enc.id,
      occurredAt: enc.occurredAt,
      bpSystolic: enc.triageRecord!.bpSystolic,
      bpDiastolic: enc.triageRecord!.bpDiastolic,
      heartRate: enc.triageRecord!.heartRate,
      respiratoryRate: enc.triageRecord!.respiratoryRate,
      temperatureC: enc.triageRecord!.temperatureC
        ? Number(enc.triageRecord!.temperatureC)
        : null,
      spo2: enc.triageRecord!.spo2,
      weightKg: enc.triageRecord!.weightKg
        ? Number(enc.triageRecord!.weightKg)
        : null,
      heightCm: enc.triageRecord!.heightCm
        ? Number(enc.triageRecord!.heightCm)
        : null,
    }))
    .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime()) // chronological for charts

  // Get total encounter count for pagination info
  const totalEncounters = await db.encounter.count({
    where: {
      patientId: data.patientId,
      deletedAt: null,
      status: {
        in: ["DONE", "FOR_LAB", "FOR_PHARMACY", "CANCELLED"],
      },
    },
  })

  const fullName = [patient.firstName, patient.middleName, patient.lastName]
    .filter(Boolean)
    .join(" ")

  return {
    ok: true,
    data: {
      patient: {
        id: patient.id,
        fullName,
        patientCode: patient.patientCode,
      },
      encounters: encounterSummaries,
      aggregatedDiagnoses,
      aggregatedMedications,
      vitalsHistory,
      totalEncounters,
    },
  }
}
