"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { getEncounterForConsultSchema } from "@/lib/validators/doctor"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"
import type { Prisma } from "@prisma/client"

// Export types for use in components
export interface PatientAllergyForConsult {
  id: string
  allergen: string
  category: string | null
  severity: string
  reaction: string | null
  status: string
}

export interface TriageRecordForConsult {
  id: string
  bpSystolic: number | null
  bpDiastolic: number | null
  heartRate: number | null
  respiratoryRate: number | null
  temperatureC: number | null
  spo2: number | null
  weightKg: number | null
  heightCm: number | null
  notes: string | null
  symptomOnset: string | null
  symptomDuration: string | null
  painSeverity: number | null
  associatedSymptoms: string[]
  exposureFlags: string[]
  exposureNotes: string | null
  recordedAt: Date
}

export interface DiagnosisForConsult {
  id: string
  text: string
  subcategoryId: string | null
  subcategory: {
    code: string
    name: string
    icdMappings: {
      icd10Code: string
      icdTitle: string
      isDefault: boolean
    }[]
  } | null
  createdAt: Date
}

export interface PrescriptionItemForConsult {
  id: string
  medicineName: string
  dosage: string | null
  frequency: string | null
  duration: string | null
  quantity: number | null
  instructions: string | null
}

export interface PrescriptionForConsult {
  id: string
  notes: string | null
  items: PrescriptionItemForConsult[]
  createdAt: Date
}

export interface LabOrderItemForConsult {
  id: string
  testCode: string | null
  testName: string
  notes: string | null
}

export interface LabOrderForConsult {
  id: string
  status: string
  items: LabOrderItemForConsult[]
  requestedAt: Date
}

export interface PatientForConsult {
  id: string
  patientCode: string
  firstName: string
  middleName: string | null
  lastName: string
  birthDate: Date
  sex: string
  phone: string | null
  allergyStatus: string
  // Lifestyle
  isSmoker: boolean | null
  smokingPackYears: number | null
  isAlcohol: boolean | null
  pregnancyStatus: string | null
  pregnancyWeeks: number | null
  // Medical background (JSON)
  medicalHistoryData: Prisma.JsonValue
  familyHistoryData: Prisma.JsonValue
  socialHistoryData: Prisma.JsonValue
  // Allergies
  allergies: PatientAllergyForConsult[]
}

export interface EncounterForConsult {
  id: string
  status: string
  occurredAt: Date
  chiefComplaint: string | null
  triageNotes: string | null
  consultStartedAt: Date | null
  consultEndedAt: Date | null
  // Doctor's notes (JSON)
  hpiDoctorNotes: Prisma.JsonValue
  physicalExamData: Prisma.JsonValue
  clinicalImpression: string | null
  proceduresData: Prisma.JsonValue
  adviceData: Prisma.JsonValue
  // Relations
  patient: PatientForConsult
  triageRecord: TriageRecordForConsult | null
  diagnoses: DiagnosisForConsult[]
  prescriptions: PrescriptionForConsult[]
  labOrders: LabOrderForConsult[]
}

export async function getEncounterForConsultAction(input: {
  encounterId: string
}): Promise<ActionResult<EncounterForConsult>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const validation = validateInput(getEncounterForConsultSchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  const encounter = await db.encounter.findFirst({
    where: {
      id: data.encounterId,
      facilityId: session.facilityId,
      deletedAt: null,
      patient: {
        deletedAt: null,
      },
    },
    include: {
      patient: {
        include: {
          allergies: {
            where: {
              deletedAt: null,
              status: "ACTIVE",
            },
            select: {
              id: true,
              allergen: true,
              category: true,
              severity: true,
              reaction: true,
              status: true,
            },
          },
        },
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
                where: { deletedAt: null, isActive: true },
                select: {
                  icd10Code: true,
                  icdTitle: true,
                  isDefault: true,
                },
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
            select: {
              id: true,
              medicineName: true,
              dosage: true,
              frequency: true,
              duration: true,
              quantity: true,
              instructions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      labOrders: {
        where: { deletedAt: null },
        include: {
          items: {
            select: {
              id: true,
              testCode: true,
              testName: true,
              notes: true,
            },
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

  // Transform to match interface (handle Decimal types)
  const result: EncounterForConsult = {
    id: encounter.id,
    status: encounter.status,
    occurredAt: encounter.occurredAt,
    chiefComplaint: encounter.chiefComplaint,
    triageNotes: encounter.triageNotes,
    consultStartedAt: encounter.consultStartedAt,
    consultEndedAt: encounter.consultEndedAt,
    hpiDoctorNotes: encounter.hpiDoctorNotes,
    physicalExamData: encounter.physicalExamData,
    clinicalImpression: encounter.clinicalImpression,
    proceduresData: encounter.proceduresData,
    adviceData: encounter.adviceData,
    patient: {
      id: encounter.patient.id,
      patientCode: encounter.patient.patientCode,
      firstName: encounter.patient.firstName,
      middleName: encounter.patient.middleName,
      lastName: encounter.patient.lastName,
      birthDate: encounter.patient.birthDate,
      sex: encounter.patient.sex,
      phone: encounter.patient.phone,
      allergyStatus: encounter.patient.allergyStatus,
      isSmoker: encounter.patient.isSmoker,
      smokingPackYears: encounter.patient.smokingPackYears,
      isAlcohol: encounter.patient.isAlcohol,
      pregnancyStatus: encounter.patient.pregnancyStatus,
      pregnancyWeeks: encounter.patient.pregnancyWeeks,
      medicalHistoryData: encounter.patient.medicalHistoryData,
      familyHistoryData: encounter.patient.familyHistoryData,
      socialHistoryData: encounter.patient.socialHistoryData,
      allergies: encounter.patient.allergies,
    },
    triageRecord: encounter.triageRecord
      ? {
          id: encounter.triageRecord.id,
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
      subcategoryId: d.subcategoryId,
      subcategory: d.subcategory
        ? {
            code: d.subcategory.code,
            name: d.subcategory.name,
            icdMappings: d.subcategory.icdMappings,
          }
        : null,
      createdAt: d.createdAt,
    })),
    prescriptions: encounter.prescriptions.map((p) => ({
      id: p.id,
      notes: p.notes,
      items: p.items,
      createdAt: p.createdAt,
    })),
    labOrders: encounter.labOrders.map((lo) => ({
      id: lo.id,
      status: lo.status,
      items: lo.items,
      requestedAt: lo.requestedAt,
    })),
  }

  return { ok: true, data: result }
}
