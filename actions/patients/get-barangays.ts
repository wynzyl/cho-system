"use server"

import { db } from "@/lib/db"
import { requireSessionForAction } from "@/lib/auth/guards"
import type { ActionResult } from "@/lib/auth/types"

export type BarangayOption = {
  id: string
  code: string
  name: string
}

export async function getBarangaysAction(): Promise<ActionResult<BarangayOption[]>> {
  await requireSessionForAction()

  const barangays = await db.barangay.findMany({
    where: { isActive: true },
    select: { id: true, code: true, name: true },
    orderBy: { name: "asc" },
  })

  return {
    ok: true,
    data: barangays,
  }
}
