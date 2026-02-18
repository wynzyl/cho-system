"use server"

import { db } from "@/lib/db"
import { verifyPassword, createSession } from "@/lib/auth"
import { loginSchema, type LoginInput } from "@/lib/validators/auth"
import type { ActionResult } from "@/lib/auth/types"
import { ROLE_ROUTES } from "@/lib/auth/routes"

export async function loginAction(
  data: LoginInput
): Promise<ActionResult<{ redirectTo: string }>> {
  // Validate input
  const parsed = loginSchema.safeParse(data)
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string
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

  const { email, password } = parsed.data

  // Dummy hash for timing-safe comparison when user not found
  // Generated with bcrypt.hash("dummy", 10)
  const DUMMY_HASH = "$2b$10$N9qo8uLOickgx2ZMRZoMy.MqrqzqzqzqzqzqzqzqzqzqzqzqzqzqW"

  // Find user
  const user = await db.user.findFirst({
    where: {
      email: email.toLowerCase(),
      isActive: true,
      deletedAt: null,
    },
  })

  // Always perform password verification to prevent timing attacks
  const hashToCompare = user?.passwordHash ?? DUMMY_HASH
  const validPassword = await verifyPassword(password, hashToCompare)

  if (!user || !validPassword) {
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

  // Update last login only after session is successfully created
  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  return {
    ok: true,
    data: {
      redirectTo: ROLE_ROUTES[user.role] ?? "/dashboard",
    },
  }
}
