import { redirect } from "next/navigation"
import { getSession } from "./session"
import { SessionUser } from "./types"
import { Role } from "@prisma/client"

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
