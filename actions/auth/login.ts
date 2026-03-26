"use server"

import { headers } from "next/headers"
import { db } from "@/lib/db"
import { verifyPassword, createSession } from "@/lib/auth"
import { loginSchema, type LoginInput } from "@/lib/validators/auth"
import { validateInput } from "@/lib/utils"
import type { ActionResult } from "@/lib/auth/types"
import { ROLE_ROUTES } from "@/lib/auth/routes"
import {
  reserveAttempt,
  confirmAttempt,
  rejectAttempt,
} from "@/lib/security/rate-limiter"

/**
 * Extract client IP from request headers
 * Checks x-forwarded-for first (for proxies), then x-real-ip
 */
async function getClientIp(): Promise<string> {
  const headersList = await headers()

  // x-forwarded-for may contain multiple IPs, take the first (original client)
  const forwardedFor = headersList.get("x-forwarded-for")
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0].trim()
    if (firstIp) return firstIp
  }

  const realIp = headersList.get("x-real-ip")
  if (realIp) return realIp

  // Fallback for local development
  return "127.0.0.1"
}

export async function loginAction(
  data: LoginInput
): Promise<ActionResult<{ redirectTo: string }>> {
  const validation = validateInput(loginSchema, data)
  if (!validation.ok) return validation.result
  const { email, password } = validation.data

  // Normalize email once for consistent rate limiting and lookup
  const normalizedEmail = email.trim().toLowerCase()

  // Get client IP for rate limiting
  const clientIp = await getClientIp()

  // Atomically reserve an attempt slot (prevents race conditions)
  // This increments the counter BEFORE password verification
  const reservation = reserveAttempt(clientIp, normalizedEmail)
  if (!reservation.allowed) {
    const retryMinutes = Math.ceil((reservation.retryAfterMs ?? 0) / 60000)
    return {
      ok: false,
      error: {
        code: "RATE_LIMITED",
        message: `Too many login attempts. Please try again in ${retryMinutes} minute${retryMinutes !== 1 ? "s" : ""}.`,
      },
    }
  }

  // Dummy hash for timing-safe comparison when user not found
  // Generated with bcrypt.hash("dummy", 10)
  const DUMMY_HASH = "$2b$10$N9qo8uLOickgx2ZMRZoMy.MqrqzqzqzqzqzqzqzqzqzqzqzqzqzqW"

  // Find user
  const user = await db.user.findFirst({
    where: {
      email: normalizedEmail,
      isActive: true,
      deletedAt: null,
    },
  })

  // Always perform password verification to prevent timing attacks
  const hashToCompare = user?.passwordHash ?? DUMMY_HASH
  const validPassword = await verifyPassword(password, hashToCompare)

  if (!user || !validPassword) {
    // Attempt already counted by reserveAttempt - just clean up the reservation
    if (reservation.token) {
      rejectAttempt(reservation.token)
    }

    return {
      ok: false,
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Invalid credentials",
      },
    }
  }

  // Create session first - if this fails, we haven't modified any data
  try {
    await createSession({
      id: user.id,
      role: user.role,
      name: user.name,
      facilityId: user.facilityId,
      scope: user.scope,
    })
  } catch (error) {
    console.error("Failed to create session:", error)
    return {
      ok: false,
      error: {
        code: "SESSION_ERROR",
        message: "Login failed. Please try again.",
      },
    }
  }

  // Clear rate limit records on successful login
  if (reservation.token) {
    confirmAttempt(reservation.token)
  }

  // Update last login only after session is successfully created
  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  return {
    ok: true,
    data: {
      redirectTo: ROLE_ROUTES[user.role] ?? "/dashboard/triage",
    },
  }
}
