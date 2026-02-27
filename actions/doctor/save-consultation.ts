"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { saveConsultationSchema, type SaveConsultationInput } from "@/lib/validators/doctor"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"

export async function saveConsultationAction(
  input: SaveConsultationInput
): Promise<ActionResult<{ encounterId: string }>> {
  const session = await requireRoleForAction(["DOCTOR"])

  const validation = validateInput(saveConsultationSchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  // Verify encounter exists and is in IN_CONSULT status with this doctor
  const encounter = await db.encounter.findFirst({
    where: {
      id: data.encounterId,
      facilityId: session.facilityId,
      status: "IN_CONSULT",
      doctorId: session.userId,
      deletedAt: null,
    },
  })

  if (!encounter) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "Encounter not found or you are not the assigned doctor",
      },
    }
  }

  // Update encounter with consultation data
  await db.encounter.update({
    where: { id: data.encounterId },
    data: {
      hpiDoctorNotes: data.hpiDoctorNotes ?? undefined,
      physicalExamData: data.physicalExamData ?? undefined,
      clinicalImpression: data.clinicalImpression ?? undefined,
      proceduresData: data.proceduresData ?? undefined,
      adviceData: data.adviceData ?? undefined,
    },
  })

  return {
    ok: true,
    data: { encounterId: data.encounterId },
  }
}
