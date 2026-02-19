"use server"

import { getSession } from "@/lib/auth/session"
import type { SessionUser } from "@/lib/auth/types"

export async function getSessionAction(): Promise<SessionUser | null> {
  return getSession()
}
