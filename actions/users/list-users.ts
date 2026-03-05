"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { validateInput } from "@/lib/utils"
import { listUsersSchema, type ListUsersInput } from "@/lib/validators/users"
import type { ActionResult } from "@/lib/auth/types"
import type { Role, UserScope } from "@prisma/client"

export interface UserListItem {
  id: string
  name: string
  email: string
  role: Role
  scope: UserScope
  isActive: boolean
  lastLoginAt: Date | null
  createdAt: Date
  facility: {
    id: string
    code: string
    name: string
  }
}

export interface ListUsersResult {
  users: UserListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function listUsersAction(
  input: ListUsersInput
): Promise<ActionResult<ListUsersResult>> {
  await requireRoleForAction(["ADMIN"])

  const validation = validateInput(listUsersSchema, input)
  if (!validation.ok) return validation.result
  const { query, page, pageSize, roleFilter, facilityFilter, statusFilter } = validation.data

  // Build where clause with search conditions
  const orConditions: object[] = query.trim()
    ? [
        { name: { contains: query.trim(), mode: "insensitive" as const } },
        { email: { contains: query.trim(), mode: "insensitive" as const } },
      ]
    : []

  const whereClause = {
    deletedAt: null,
    ...(orConditions.length > 0 ? { OR: orConditions } : {}),
    ...(roleFilter && roleFilter !== "all" ? { role: roleFilter } : {}),
    ...(facilityFilter && facilityFilter !== "all" ? { facilityId: facilityFilter } : {}),
    ...(statusFilter === "active" ? { isActive: true } : {}),
    ...(statusFilter === "inactive" ? { isActive: false } : {}),
  }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        scope: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        facility: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.user.count({ where: whereClause }),
  ])

  return {
    ok: true,
    data: {
      users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}
