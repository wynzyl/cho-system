"use server"

import { db } from "@/lib/db"
import { verifyPassword, createSession } from "@/lib/auth"
import { loginSchema, type LoginInput } from "@/lib/validators/auth"
import type { ActionResult } from "@/lib/auth/types"

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

  // Find user
  const user = await db.user.findFirst({
    where: {
      email: email.toLowerCase(),
      isActive: true,
      deletedAt: null,
    },
  })

  if (!user) {
    return {
      ok: false,
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Invalid credentials",
      },
    }
  }

  // Verify password
  const validPassword = await verifyPassword(password, user.passwordHash)
  if (!validPassword) {
    return {
      ok: false,
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Invalid credentials",
      },
    }
  }

  // Update last login
  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  // Create session
  await createSession({
    id: user.id,
    role: user.role,
    name: user.name,
    facilityId: user.facilityId,
    scope: user.scope,
  })

  // Determine redirect based on role
  const roleRoutes: Record<string, string> = {
    ADMIN: "/dashboard",
    TRIAGE: "/dashboard/triage",
    DOCTOR: "/dashboard/doctor",
    LAB: "/dashboard/laboratory",
    PHARMACY: "/dashboard/pharmacy",
  }

  return {
    ok: true,
    data: {
      redirectTo: roleRoutes[user.role] ?? "/dashboard",
    },
  }
}
