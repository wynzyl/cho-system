"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { validateInput } from "@/lib/utils"
import { updateUserSchema, type UpdateUserInput } from "@/lib/validators/users"
import type { ActionResult } from "@/lib/auth/types"

export async function updateUserAction(
  input: UpdateUserInput
): Promise<ActionResult<{ updated: true }>> {
  const session = await requireRoleForAction(["ADMIN"])

  const validation = validateInput(updateUserSchema, input)
  if (!validation.ok) return validation.result
  const { userId, ...updateData } = validation.data

  // Prevent self-deactivation
  if (userId === session.userId && updateData.isActive === false) {
    return {
      ok: false,
      error: {
        code: "SELF_DEACTIVATION",
        message: "You cannot deactivate your own account",
      },
    }
  }

  const result = await db.$transaction(async (tx) => {
    // Get current user data for comparison
    const currentUser = await tx.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        scope: true,
        facilityId: true,
        isActive: true,
      },
    })

    if (!currentUser) {
      return {
        ok: false as const,
        error: {
          code: "NOT_FOUND",
          message: "User not found",
        },
      }
    }

    // Check email uniqueness if email is being changed
    if (updateData.email && updateData.email.toLowerCase() !== currentUser.email.toLowerCase()) {
      const existing = await tx.user.findFirst({
        where: {
          email: updateData.email.toLowerCase(),
          deletedAt: null,
          id: { not: userId },
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
    }

    // Build update data
    const updatePayload: Parameters<typeof tx.user.update>[0]["data"] = {}
    const changes: Record<string, { from: string | boolean; to: string | boolean }> = {}

    if (updateData.name !== undefined && updateData.name !== currentUser.name) {
      updatePayload.name = updateData.name.trim()
      changes.name = { from: currentUser.name, to: updateData.name.trim() }
    }
    if (updateData.email !== undefined && updateData.email.toLowerCase() !== currentUser.email.toLowerCase()) {
      updatePayload.email = updateData.email.toLowerCase().trim()
      changes.email = { from: currentUser.email, to: updateData.email.toLowerCase().trim() }
    }
    if (updateData.role !== undefined && updateData.role !== currentUser.role) {
      updatePayload.role = updateData.role
      changes.role = { from: currentUser.role, to: updateData.role }
    }
    if (updateData.scope !== undefined && updateData.scope !== currentUser.scope) {
      updatePayload.scope = updateData.scope
      changes.scope = { from: currentUser.scope, to: updateData.scope }
    }
    if (updateData.facilityId !== undefined && updateData.facilityId !== currentUser.facilityId) {
      updatePayload.facilityId = updateData.facilityId
      changes.facilityId = { from: currentUser.facilityId, to: updateData.facilityId }
    }
    if (updateData.isActive !== undefined && updateData.isActive !== currentUser.isActive) {
      updatePayload.isActive = updateData.isActive
      changes.isActive = { from: currentUser.isActive, to: updateData.isActive }
    }

    // Only update if there are changes
    if (Object.keys(updatePayload).length === 0) {
      return { ok: true as const }
    }

    await tx.user.update({
      where: { id: userId },
      data: updatePayload,
    })

    // Determine audit action based on changes
    const action = changes.role ? "ROLE_CHANGE" : "UPDATE"

    // Flatten changes for JSON storage
    const changesSummary: Record<string, string> = {}
    for (const [field, { from, to }] of Object.entries(changes)) {
      changesSummary[`${field}_from`] = String(from)
      changesSummary[`${field}_to`] = String(to)
    }

    // Audit log
    await tx.auditLog.create({
      data: {
        userId: session.userId,
        userName: session.name,
        action,
        entity: "User",
        entityId: userId,
        metadata: changesSummary,
      },
    })

    return { ok: true as const }
  })

  if (!result.ok) {
    return result
  }

  return { ok: true, data: { updated: true } }
}
