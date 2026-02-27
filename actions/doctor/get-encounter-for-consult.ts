"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import {
  getEncounterForConsultSchema,
  type GetEncounterForConsultInput,
} from "@/lib/validators/doctor"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"
import type {
  EncounterStatus,
  AllergySeverity,
  AllergyStatus,
  PatientAllergyStatus,
  Sex,
  CivilStatus,
  BloodType,
} from "@prisma/client"
import type {
  MedicalHistoryData,
  FamilyHistoryData,
  SocialHistoryData,
  HpiDoctorNotes,
  PhysicalExamData,
  ProceduresData,
  AdviceData,
} from "@/lib/types/consultation"

export interface EncounterForConsult {
  id: string
  status: EncounterStatus
  occurredAt: Date
  chiefComplaint: string | null
  triageNotes: string | null
  consultStartedAt: Date | null
  consultEndedAt: Date | null
  hpiDoctorNotes: HpiDoctorNotes | null
  physicalExamData: PhysicalExamData | null
  clinicalImpression: string | null
  proceduresData: ProceduresData | null
  adviceData: AdviceData | null
  patient: PatientForConsult
  triageRecord: TriageRecordForConsult | null
  diagnoses: DiagnosisForConsult[]
  prescriptions: PrescriptionForConsult[]
  labOrders: LabOrderForConsult[]
}

export interface PatientForConsult {
  id: string
  patientCode: string
  firstName: string
  middleName: string | null
  lastName: string
  birthDate: Date
  sex: Sex
  civilStatus: CivilStatus | null
  bloodType: BloodType | null
  occupation: string | null
  phone: string | null
  addressLine: string | null
  barangay: { name: string } | null
  allergyStatus: PatientAllergyStatus
  // Lifestyle
  isSmoker: boolean | null
  smokingPackYears: number | null
  isAlcohol: boolean | null
  pregnancyStatus: string | null
  pregnancyWeeks: number | null
  // Medical Background
  medicalHistoryData: MedicalHistoryData | null
  familyHistoryData: FamilyHistoryData | null
  socialHistoryData: SocialHistoryData | null
  // Allergies
  allergies: PatientAllergyForConsult[]
}

export interface PatientAllergyForConsult {
  id: string
  allergen: string
  category: string | null
  severity: AllergySeverity
  reaction: string | null
  status: AllergyStatus
  notes: string | null
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
  // HPI Screening
  symptomOnset: string | null
  symptomDuration: string | null
  painSeverity: number | null
  associatedSymptoms: string[]
  // Exposure
  exposureFlags: string[]
  exposureNotes: string | null
  recordedAt: Date
  recordedBy: { name: string } | null
}

export interface DiagnosisForConsult {
  id: string
  text: string
  subcategory: {
    id: string
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

export interface PrescriptionForConsult {
  id: string
  notes: string | null
  createdAt: Date
  items: {
    id: string
    medicineName: string
    dosage: string | null
    frequency: string | null
    duration: string | null
    quantity: number | null
    instructions: string | null
  }[]
}

export interface LabOrderForConsult {
  id: string
  status: string
  requestedAt: Date
  items: {
    id: string
    testCode: string | null
    testName: string
    notes: string | null
  }[]
}

export async function getEncounterForConsultAction(
  input: GetEncounterForConsultInput
): Promise<ActionResult<EncounterForConsult>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const validation = validateInput(getEncounterForConsultSchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  const encounter = await db.encounter.findFirst({
    where: {
      id: data.encounterId,
      facilityId: session.facilityId,
      deletedAt: null,
    },
    include: {
      patient: {
        include: {
          barangay: { select: { name: true } },
          allergies: {
            where: { deletedAt: null },
            orderBy: { severity: "desc" },
          },
        },
      },
      triageRecord: {
        include: {
          recordedBy: { select: { name: true } },
        },
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
          },
        },
        orderBy: { createdAt: "desc" },
      },
      labOrders: {
        where: { deletedAt: null },
        include: {
          items: true,
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

  // Transform to EncounterForConsult
  const result: EncounterForConsult = {
    id: encounter.id,
    status: encounter.status,
    occurredAt: encounter.occurredAt,
    chiefComplaint: encounter.chiefComplaint,
    triageNotes: encounter.triageNotes,
    consultStartedAt: encounter.consultStartedAt,
    consultEndedAt: encounter.consultEndedAt,
    hpiDoctorNotes: encounter.hpiDoctorNotes as HpiDoctorNotes | null,
    physicalExamData: encounter.physicalExamData as PhysicalExamData | null,
    clinicalImpression: encounter.clinicalImpression,
    proceduresData: encounter.proceduresData as ProceduresData | null,
    adviceData: encounter.adviceData as AdviceData | null,
    patient: {
      id: encounter.patient.id,
      patientCode: encounter.patient.patientCode,
      firstName: encounter.patient.firstName,
      middleName: encounter.patient.middleName,
      lastName: encounter.patient.lastName,
      birthDate: encounter.patient.birthDate,
      sex: encounter.patient.sex,
      civilStatus: encounter.patient.civilStatus,
      bloodType: encounter.patient.bloodType,
      occupation: encounter.patient.occupation,
      phone: encounter.patient.phone,
      addressLine: encounter.patient.addressLine,
      barangay: encounter.patient.barangay,
      allergyStatus: encounter.patient.allergyStatus,
      isSmoker: encounter.patient.isSmoker,
      smokingPackYears: encounter.patient.smokingPackYears,
      isAlcohol: encounter.patient.isAlcohol,
      pregnancyStatus: encounter.patient.pregnancyStatus,
      pregnancyWeeks: encounter.patient.pregnancyWeeks,
      medicalHistoryData: encounter.patient.medicalHistoryData as MedicalHistoryData | null,
      familyHistoryData: encounter.patient.familyHistoryData as FamilyHistoryData | null,
      socialHistoryData: encounter.patient.socialHistoryData as SocialHistoryData | null,
      allergies: encounter.patient.allergies.map((a) => ({
        id: a.id,
        allergen: a.allergen,
        category: a.category,
        severity: a.severity,
        reaction: a.reaction,
        status: a.status,
        notes: a.notes,
      })),
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
          recordedBy: encounter.triageRecord.recordedBy,
        }
      : null,
    diagnoses: encounter.diagnoses.map((d) => ({
      id: d.id,
      text: d.text,
      subcategory: d.subcategory
        ? {
            id: d.subcategory.id,
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
      createdAt: p.createdAt,
      items: p.items.map((i) => ({
        id: i.id,
        medicineName: i.medicineName,
        dosage: i.dosage,
        frequency: i.frequency,
        duration: i.duration,
        quantity: i.quantity,
        instructions: i.instructions,
      })),
    })),
    labOrders: encounter.labOrders.map((lo) => ({
      id: lo.id,
      status: lo.status,
      requestedAt: lo.requestedAt,
      items: lo.items.map((i) => ({
        id: i.id,
        testCode: i.testCode,
        testName: i.testName,
        notes: i.notes,
      })),
    })),
  }

  return {
    ok: true,
    data: result,
  }
}
