"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { validateInput } from "@/lib/utils"
import { toggleUserStatusSchema, type ToggleUserStatusInput } from "@/lib/validators/users"
import type { ActionResult } from "@/lib/auth/types"

export async function toggleUserStatusAction(
  input: ToggleUserStatusInput
): Promise<ActionResult<{ isActive: boolean }>> {
  const session = await requireRoleForAction(["ADMIN"])

  const validation = validateInput(toggleUserStatusSchema, input)
  if (!validation.ok) return validation.result
  const { userId } = validation.data

  // Prevent self-deactivation
  if (userId === session.userId) {
    return {
      ok: false,
      error: {
        code: "SELF_DEACTIVATION",
        message: "You cannot change your own account status",
      },
    }
  }

  const result = await db.$transaction(async (tx) => {
    const user = await tx.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        isActive: true,
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

    const newStatus = !user.isActive

    await tx.user.update({
      where: { id: userId },
      data: { isActive: newStatus },
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
          statusChange: {
            from: user.isActive ? "active" : "inactive",
            to: newStatus ? "active" : "inactive",
          },
          targetUserName: user.name,
        },
      },
    })

    return { ok: true as const, isActive: newStatus }
  })

  if (!result.ok) {
    return result
  }

  return { ok: true, data: { isActive: result.isActive } }
}
