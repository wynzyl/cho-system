"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { validateInput } from "@/lib/utils"
import { hashPassword } from "@/lib/auth/password"
import { createUserSchema, type CreateUserInput } from "@/lib/validators/users"
import type { ActionResult } from "@/lib/auth/types"

export interface CreateUserResult {
  userId: string
}

export async function createUserAction(
  input: CreateUserInput
): Promise<ActionResult<CreateUserResult>> {
  const session = await requireRoleForAction(["ADMIN"])

  const validation = validateInput(createUserSchema, input)
  if (!validation.ok) return validation.result
  const data = validation.data

  const normalizedEmail = data.email.toLowerCase().trim()

  const result = await db.$transaction(async (tx) => {
    // Check email uniqueness (case-insensitive)
    const existing = await tx.user.findFirst({
      where: {
        email: normalizedEmail,
        deletedAt: null,
      },
      select: { id: true },
    })

    if (existing) {
      return {
        ok: false as const,
        error: {
          code: "DUPLICATE_EMAIL",
          message: "Email already exists",
          fieldErrors: { email: ["Email already exists"] },
        },
      }
    }

    // Hash password
    const passwordHash = await hashPassword(data.password)

    // Create user
    const user = await tx.user.create({
      data: {
        name: data.name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: data.role,
        facilityId: data.facilityId,
        scope: data.scope,
        isActive: true,
      },
      select: { id: true },
    })

    // Audit log
    await tx.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: "CREATE",
        entity: "User",
        entityId: user.id,
        metadata: {
          name: data.name,
          email: normalizedEmail,
          role: data.role,
          scope: data.scope,
        },
      },
    })

    return { ok: true as const, userId: user.id }
  })

  if (!result.ok) {
    return result
  }

  return { ok: true, data: { userId: result.userId } }
}
