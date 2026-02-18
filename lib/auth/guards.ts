import { redirect } from "next/navigation"
import { getSession } from "./session"
import { SessionUser } from "./types"
import { Role } from "@prisma/client"

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  return session
}

export async function requireRole(allowedRoles: Role[]): Promise<SessionUser> {
  const session = await requireSession()

  // ADMIN always has access
  if (session.role === "ADMIN") {
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
    throw new Error("UNAUTHORIZED")
  }
  return session
}

export async function requireRoleForAction(
  allowedRoles: Role[]
): Promise<SessionUser> {
  const session = await requireSessionForAction()

  if (session.role === "ADMIN") {
    return session
  }

  if (!allowedRoles.includes(session.role)) {
    throw new Error("FORBIDDEN")
  }

  return session
}
