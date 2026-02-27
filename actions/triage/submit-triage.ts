"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { submitTriageSchema, type SubmitTriageInput } from "@/lib/validators/triage"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"

export async function submitTriageAction(
  input: SubmitTriageInput
): Promise<ActionResult<{ encounterId: string; triageRecordId: string }>> {
  const session = await requireRoleForAction(["TRIAGE"])

  const validation = validateInput(submitTriageSchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  // Verify encounter exists with WAIT_TRIAGE status and belongs to user's facility
  const encounter = await db.encounter.findFirst({
    where: {
      id: data.encounterId,
      facilityId: session.facilityId,
      status: "WAIT_TRIAGE",
      deletedAt: null,
    },
    include: {
      patient: {
        select: {
          patientCode: true,
        },
      },
    },
  })

  if (!encounter) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Encounter not found or not in WAIT_TRIAGE status",
      },
    }
  }

  const result = await db.$transaction(async (tx) => {
    // Create or update TriageRecord with vitals and HPI screening (upsert handles reused encounters)
    const triageRecord = await tx.triageRecord.upsert({
      where: { encounterId: data.encounterId },
      create: {
        encounterId: data.encounterId,
        bpSystolic: data.bpSystolic ?? null,
        bpDiastolic: data.bpDiastolic ?? null,
        heartRate: data.heartRate ?? null,
        respiratoryRate: data.respiratoryRate ?? null,
        temperatureC: data.temperatureC ?? null,
        spo2: data.spo2 ?? null,
        weightKg: data.weightKg ?? null,
        heightCm: data.heightCm ?? null,
        notes: data.triageNotes ?? null,
        // HPI Screening
        symptomOnset: data.symptomOnset ?? null,
        symptomDuration: data.symptomDuration ?? null,
        painSeverity: data.painSeverity ?? null,
        associatedSymptoms: data.associatedSymptoms ?? [],
        // Exposure Screening
        exposureFlags: data.exposureFlags ?? [],
        exposureNotes: data.exposureNotes ?? null,
        recordedById: session.userId,
      },
      update: {
        bpSystolic: data.bpSystolic ?? null,
        bpDiastolic: data.bpDiastolic ?? null,
        heartRate: data.heartRate ?? null,
        respiratoryRate: data.respiratoryRate ?? null,
        temperatureC: data.temperatureC ?? null,
        spo2: data.spo2 ?? null,
        weightKg: data.weightKg ?? null,
        heightCm: data.heightCm ?? null,
        notes: data.triageNotes ?? null,
        // HPI Screening
        symptomOnset: data.symptomOnset ?? null,
        symptomDuration: data.symptomDuration ?? null,
        painSeverity: data.painSeverity ?? null,
        associatedSymptoms: data.associatedSymptoms ?? [],
        // Exposure Screening
        exposureFlags: data.exposureFlags ?? [],
        exposureNotes: data.exposureNotes ?? null,
        recordedById: session.userId,
        recordedAt: new Date(),
      },
    })

    // Update Encounter status to TRIAGED
    await tx.encounter.update({
      where: { id: data.encounterId },
      data: {
        status: "TRIAGED",
        triageById: session.userId,
        chiefComplaint: data.chiefComplaint ?? encounter.chiefComplaint,
        triageNotes: data.triageNotes ?? null,
      },
    })

    // Create AuditLog entry
    await tx.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: "UPDATE",
        entity: "Encounter",
        entityId: data.encounterId,
        metadata: {
          action: "TRIAGE_COMPLETED",
          patientCode: encounter.patient.patientCode,
          triageRecordId: triageRecord.id,
          previousStatus: "WAIT_TRIAGE",
          newStatus: "TRIAGED",
        },
      },
    })

    return triageRecord
  })

  return {
    ok: true,
    data: {
      encounterId: data.encounterId,
      triageRecordId: result.id,
    },
  }
}
