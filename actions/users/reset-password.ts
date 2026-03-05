"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { validateInput } from "@/lib/utils"
import { hashPassword } from "@/lib/auth/password"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validators/users"
import type { ActionResult } from "@/lib/auth/types"

export async function resetPasswordAction(
  input: ResetPasswordInput
): Promise<ActionResult<{ reset: true }>> {
  const session = await requireRoleForAction(["ADMIN"])

  const validation = validateInput(resetPasswordSchema, input)
  if (!validation.ok) return validation.result
  const { userId, newPassword } = validation.data

  const result = await db.$transaction(async (tx) => {
    const user = await tx.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    if (!user) {
      return {
        ok: false as const,
        error: {
          code: "NOT_FOUND",
          message: "User not found",
        },
      }
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword)

    await tx.user.update({
      where: { id: userId },
      data: { passwordHash },
    })

    // Audit log
    await tx.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action: "UPDATE",
        entity: "User",
        entityId: userId,
        metadata: {
          passwordReset: true,
          targetUserName: user.name,
          targetUserEmail: user.email,
        },
      },
    })

    return { ok: true as const }
  })

  if (!result.ok) {
    return result
  }

  return { ok: true, data: { reset: true } }
}
