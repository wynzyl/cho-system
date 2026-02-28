"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { getEncounterDetailsSchema } from "@/lib/validators/doctor"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"
import type { HistoricalEncounterDetails } from "@/lib/types/patient-history"

export async function getEncounterDetailsAction(input: {
  encounterId: string
}): Promise<ActionResult<HistoricalEncounterDetails>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const validation = validateInput(getEncounterDetailsSchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  const encounter = await db.encounter.findFirst({
    where: {
      id: data.encounterId,
      deletedAt: null,
      patient: {
        deletedAt: null,
      },
    },
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
      triageRecord: {
        where: { deletedAt: null },
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
        orderBy: { createdAt: "asc" },
      },
      prescriptions: {
        where: { deletedAt: null },
        include: {
          items: {
            where: { deletedAt: null },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      labOrders: {
        where: { deletedAt: null },
        include: {
          items: true,
          results: {
            where: { deletedAt: null },
            orderBy: { uploadedAt: "desc" },
          },
        },
        orderBy: { requestedAt: "desc" },
      },
    },
  })

  if (!encounter) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Encounter not found",
      },
    }
  }

  // Transform to match HistoricalEncounterDetails interface
  const result: HistoricalEncounterDetails = {
    id: encounter.id,
    occurredAt: encounter.occurredAt,
    status: encounter.status,
    chiefComplaint: encounter.chiefComplaint,
    triageNotes: encounter.triageNotes,
    clinicalImpression: encounter.clinicalImpression,
    consultStartedAt: encounter.consultStartedAt,
    consultEndedAt: encounter.consultEndedAt,
    hpiDoctorNotes: encounter.hpiDoctorNotes,
    physicalExamData: encounter.physicalExamData,
    proceduresData: encounter.proceduresData,
    adviceData: encounter.adviceData,
    facility: { name: encounter.facility.name },
    doctor: encounter.doctor ? { name: encounter.doctor.name } : null,
    triageBy: encounter.triageBy ? { name: encounter.triageBy.name } : null,
    triageRecord: encounter.triageRecord
      ? {
          bpSystolic: encounter.triageRecord.bpSystolic,
          bpDiastolic: encounter.triageRecord.bpDiastolic,
          heartRate: encounter.triageRecord.heartRate,
          respiratoryRate: encounter.triageRecord.respiratoryRate,
          temperatureC: encounter.triageRecord.temperatureC
            ? Number(encounter.triageRecord.temperatureC)
            : null,
          spo2: encounter.triageRecord.spo2,
          weightKg: encounter.triageRecord.weightKg
            ? Number(encounter.triageRecord.weightKg)
            : null,
          heightCm: encounter.triageRecord.heightCm
            ? Number(encounter.triageRecord.heightCm)
            : null,
          notes: encounter.triageRecord.notes,
          symptomOnset: encounter.triageRecord.symptomOnset,
          symptomDuration: encounter.triageRecord.symptomDuration,
          painSeverity: encounter.triageRecord.painSeverity,
          associatedSymptoms: encounter.triageRecord.associatedSymptoms,
          exposureFlags: encounter.triageRecord.exposureFlags,
          exposureNotes: encounter.triageRecord.exposureNotes,
          recordedAt: encounter.triageRecord.recordedAt,
        }
      : null,
    diagnoses: encounter.diagnoses.map((d) => ({
      id: d.id,
      text: d.text,
      subcategory: d.subcategory
        ? {
            code: d.subcategory.code,
            name: d.subcategory.name,
          }
        : null,
      icdCode: d.subcategory?.icdMappings[0]?.icd10Code ?? null,
      createdAt: d.createdAt,
    })),
    prescriptions: encounter.prescriptions.map((p) => ({
      id: p.id,
      items: p.items.map((item) => ({
        medicineName: item.medicineName,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        quantity: item.quantity,
        instructions: item.instructions,
      })),
      notes: p.notes,
      createdAt: p.createdAt,
    })),
    labOrders: encounter.labOrders.map((lo) => ({
      id: lo.id,
      status: lo.status,
      items: lo.items.map((item) => ({
        testCode: item.testCode,
        testName: item.testName,
        notes: item.notes,
      })),
      results: lo.results.map((r) => ({
        id: r.id,
        fileUrl: r.fileUrl,
        fileName: r.fileName,
        releasedAt: r.releasedAt,
        uploadedAt: r.uploadedAt,
      })),
      requestedAt: lo.requestedAt,
    })),
  }

  return { ok: true, data: result }
}
