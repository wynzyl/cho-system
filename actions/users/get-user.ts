"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { validateInput } from "@/lib/utils"
import { getUserSchema, type GetUserInput } from "@/lib/validators/users"
import type { ActionResult } from "@/lib/auth/types"
import type { Role, UserScope } from "@prisma/client"

export interface UserDetail {
  id: string
  name: string
  email: string
  role: Role
  scope: UserScope
  isActive: boolean
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
  facility: {
    id: string
    code: string
    name: string
    type: string
  }
}

export async function getUserAction(
  input: GetUserInput
): Promise<ActionResult<UserDetail>> {
  await requireRoleForAction(["ADMIN"])

  const validation = validateInput(getUserSchema, input)
  if (!validation.ok) return validation.result
  const { userId } = validation.data

  const user = await db.user.findFirst({
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
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
      facility: {
        select: {
          id: true,
          code: true,
          name: true,
          type: true,
        },
      },
    },
  })

  if (!user) {
    return {
      ok: false,
      error: {
        code: "NOT_FOUND",
        message: "User not found",
      },
    }
  }

  return { ok: true, data: user }
}
