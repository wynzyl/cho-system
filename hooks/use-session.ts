"use client"

import { useEffect, useState } from "react"
import { getSessionAction } from "@/actions/auth"
import type { SessionUser } from "@/lib/auth/types"

export function useSession() {
  const [session, setSession] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadSession() {
      try {
        const sess = await getSessionAction()
        setSession(sess)
      } catch {
        setSession(null)
      } finally {
        setIsLoading(false)
      }
    }
    loadSession()
  }, [])

  return { session, isLoading }
}
