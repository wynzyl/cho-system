"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import type { ActionResult } from "@/lib/auth/types"

export interface FacilityOption {
  id: string
  code: string
  name: string
  type: string
}

export async function getFacilitiesAction(): Promise<ActionResult<FacilityOption[]>> {
  await requireRoleForAction(["ADMIN"])

  const facilities = await db.facility.findMany({
    where: {
      isActive: true,
      deletedAt: null,
    },
    select: {
      id: true,
      code: true,
      name: true,
      type: true,
    },
    orderBy: [
      { type: "asc" },
      { name: "asc" },
    ],
  })

  return { ok: true, data: facilities }
}
