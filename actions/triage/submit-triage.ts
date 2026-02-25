"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { submitTriageSchema, type SubmitTriageInput } from "@/lib/validators/triage"
import type { ActionResult } from "@/lib/auth/types"

export async function submitTriageAction(
  input: SubmitTriageInput
): Promise<ActionResult<{ encounterId: string; triageRecordId: string }>> {
  const session = await requireRoleForAction(["TRIAGE"])

  const parsed = submitTriageSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0])
      if (!fieldErrors[field]) {
        fieldErrors[field] = []
      }
      fieldErrors[field].push(issue.message)
    }
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        fieldErrors,
      },
    }
  }

  const data = parsed.data

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
<<<<<<< HEAD
    // Create or update TriageRecord with vitals (upsert handles resubmission)
=======
    // Create or update TriageRecord with vitals (upsert handles reused encounters)
>>>>>>> 362c278956e3343df46a0bf4bd191b26e326e91b
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
