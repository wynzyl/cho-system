"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import type { ActionResult } from "@/lib/auth/types"
import type { EncounterStatus, Sex } from "@prisma/client"

export type EncounterDetails = {
  id: string
  status: EncounterStatus
  chiefComplaint: string | null
  triageNotes: string | null
  occurredAt: string
  patient: {
    id: string
    patientCode: string
    firstName: string
    middleName: string | null
    lastName: string
    birthDate: string
    age: number
    sex: Sex
    phone: string | null
    addressLine: string | null
    barangay: string | null
    philhealthNo: string | null
  }
  triageRecord: {
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
    recordedAt: string
  } | null
  diagnoses: {
    id: string
    text: string
    diagnosisCode: {
      id: string
      icd10Code: string
      title: string
    } | null
    createdAt: string
  }[]
  prescriptions: {
    id: string
    notes: string | null
    createdAt: string
    items: {
      id: string
      medicineName: string
      dosage: string | null
      frequency: string | null
      duration: string | null
      quantity: number | null
      instructions: string | null
    }[]
  }[]
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

export async function getEncounterDetailsAction(
  encounterId: string
): Promise<ActionResult<{ encounter: EncounterDetails }>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const encounter = await db.encounter.findFirst({
    where: {
      id: encounterId,
      facilityId: session.facilityId,
      deletedAt: null,
      // Doctor can view if:
      // 1. They own the encounter (claimed it)
      // 2. It's unclaimed (TRIAGED with no doctor)
      OR: [
        { doctorId: session.userId },
        { status: "TRIAGED", doctorId: null },
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
          phone: true,
          addressLine: true,
          philhealthNo: true,
          barangay: {
            select: {
              name: true,
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
          respiratoryRate: true,
          temperatureC: true,
          spo2: true,
          weightKg: true,
          heightCm: true,
          notes: true,
          recordedAt: true,
        },
      },
      diagnoses: {
        where: { deletedAt: null },
        include: {
          diagnosisCode: {
            select: {
              id: true,
              icd10Code: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
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
    },
  })

  if (!encounter) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Encounter not found or access denied",
      },
    }
  }

  const details: EncounterDetails = {
    id: encounter.id,
    status: encounter.status,
    chiefComplaint: encounter.chiefComplaint,
    triageNotes: encounter.triageNotes,
    occurredAt: encounter.occurredAt.toISOString(),
    patient: {
      id: encounter.patient.id,
      patientCode: encounter.patient.patientCode,
      firstName: encounter.patient.firstName,
      middleName: encounter.patient.middleName,
      lastName: encounter.patient.lastName,
      birthDate: encounter.patient.birthDate.toISOString(),
      age: calculateAge(encounter.patient.birthDate),
      sex: encounter.patient.sex,
      phone: encounter.patient.phone,
      addressLine: encounter.patient.addressLine,
      barangay: encounter.patient.barangay?.name ?? null,
      philhealthNo: encounter.patient.philhealthNo,
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
          recordedAt: encounter.triageRecord.recordedAt.toISOString(),
        }
      : null,
    diagnoses: encounter.diagnoses.map((d) => ({
      id: d.id,
      text: d.text,
      diagnosisCode: d.diagnosisCode
        ? {
            id: d.diagnosisCode.id,
            icd10Code: d.diagnosisCode.icd10Code,
            title: d.diagnosisCode.title,
          }
        : null,
      createdAt: d.createdAt.toISOString(),
    })),
    prescriptions: encounter.prescriptions.map((p) => ({
      id: p.id,
      notes: p.notes,
      createdAt: p.createdAt.toISOString(),
      items: p.items.map((item) => ({
        id: item.id,
        medicineName: item.medicineName,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        quantity: item.quantity,
        instructions: item.instructions,
      })),
    })),
  }

  return {
    ok: true,
    data: { encounter: details },
  }
}
