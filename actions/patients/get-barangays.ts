"use server"

import { unstable_cache } from "next/cache"
import { db } from "@/lib/db"
import { requireSessionForAction } from "@/lib/auth/guards"
import type { ActionResult } from "@/lib/auth/types"

export type BarangayOption = {
  id: string
  code: string
  name: string
}

const getBarangays = unstable_cache(
  async () => {
    return db.barangay.findMany({
      where: { isActive: true },
      select: { id: true, code: true, name: true },
      orderBy: { name: "asc" },
    })
  },
  ["barangays"],
  { revalidate: 86400, tags: ["barangays"] }
)

export async function getBarangaysAction(): Promise<ActionResult<BarangayOption[]>> {
  await requireSessionForAction()
  const barangays = await getBarangays()
  return { ok: true, data: barangays }
}
