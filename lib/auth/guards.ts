import { redirect } from "next/navigation"
import { getSession } from "./session"
import { SessionUser } from "./types"
import { Role } from "@prisma/client"
import { db } from "@/lib/db"

export type AuthErrorCode = "UNAUTHORIZED" | "FORBIDDEN"

export class AuthError extends Error {
  readonly code: AuthErrorCode

  constructor(code: AuthErrorCode) {
    super(code)
    this.name = "AuthError"
    this.code = code
  }
}

function hasAdminBypass(role: Role): boolean {
  return role === "ADMIN"
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  // Verify the session user still exists and is active in the database.
  // Catches stale JWTs after a DB reseed or account deactivation.
  const dbUser = await db.user.findFirst({
    where: { id: session.userId, deletedAt: null, isActive: true },
    select: { id: true },
  })
  if (!dbUser) {
    redirect("/login")
  }

  return session
}

export async function requireRole(allowedRoles: Role[]): Promise<SessionUser> {
  const session = await requireSession()

  if (hasAdminBypass(session.role)) {
    return session
  }

  if (!allowedRoles.includes(session.role)) {
    redirect("/unauthorized")
  }

  return session
}

// For server actions - throws instead of redirecting
export async function requireSessionForAction(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) {
    throw new AuthError("UNAUTHORIZED")
  }

  // Verify the session user still exists and is active in the database.
  // Catches stale JWTs after a DB reseed or account deactivation.
  const dbUser = await db.user.findFirst({
    where: { id: session.userId, deletedAt: null, isActive: true },
    select: { id: true },
  })
  if (!dbUser) {
    throw new AuthError("UNAUTHORIZED")
  }

  return session
}

export async function requireRoleForAction(
  allowedRoles: Role[]
): Promise<SessionUser> {
  const session = await requireSessionForAction()

  if (hasAdminBypass(session.role)) {
    return session
  }

  if (!allowedRoles.includes(session.role)) {
    throw new AuthError("FORBIDDEN")
  }

  return session
}
