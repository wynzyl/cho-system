"use server"

import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"
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

  // CITY_WIDE doctors can save consultations in ANY facility
  const facilityFilter =
    session.scope === "FACILITY_ONLY" ? { facilityId: session.facilityId } : {}

  // Verify encounter exists and is in IN_CONSULT status
  const isAdmin = session.role === "ADMIN"
  const encounter = await db.encounter.findFirst({
    where: {
      id: data.encounterId,
      ...facilityFilter,
      status: "IN_CONSULT",
      // ADMIN can save any consultation, regular doctors only their own
      ...(isAdmin ? {} : { doctorId: session.userId }),
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
  // Use Prisma.JsonNull to properly clear JSON fields when null is passed
  await db.encounter.update({
    where: { id: data.encounterId },
    data: {
      hpiDoctorNotes: data.hpiDoctorNotes === null ? Prisma.JsonNull : data.hpiDoctorNotes,
      physicalExamData: data.physicalExamData === null ? Prisma.JsonNull : data.physicalExamData,
      clinicalImpression: data.clinicalImpression,
      proceduresData: data.proceduresData === null ? Prisma.JsonNull : data.proceduresData,
      adviceData: data.adviceData === null ? Prisma.JsonNull : data.adviceData,
    },
  })

  return {
    ok: true,
    data: { encounterId: data.encounterId },
  }
}
