import { SignJWT, jwtVerify, JWTPayload } from "jose"
import { cookies } from "next/headers"
import { cache } from "react"
import { SessionPayload, SessionUser } from "./types"
import { Role, UserScope } from "@prisma/client"

export const SESSION_COOKIE_NAME = "cho-session"
const SESSION_DURATION_SECONDS = 8 * 60 * 60 // 8 hours

export function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set")
  }
  return new TextEncoder().encode(secret)
}

export async function createSession(user: {
  id: string
  role: Role
  name: string
  facilityId: string
  scope: UserScope
}): Promise<void> {
  const now = Math.floor(Date.now() / 1000)
  const expiresAt = now + SESSION_DURATION_SECONDS

  const payload: SessionPayload = {
    userId: user.id,
    role: user.role,
    name: user.name,
    facilityId: user.facilityId,
    scope: user.scope,
    loginTime: now,
  }

  const token = await new SignJWT(payload as JWTPayload & SessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresAt)
    .sign(getSecretKey())

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt * 1000),
  })
}

export const getSession = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    const sessionPayload = payload as JWTPayload & SessionPayload

    if (
      !sessionPayload.userId ||
      !sessionPayload.role ||
      !sessionPayload.name ||
      !sessionPayload.facilityId ||
      !sessionPayload.scope
    ) {
      return null
    }

    return {
      userId: sessionPayload.userId,
      role: sessionPayload.role,
      name: sessionPayload.name,
      facilityId: sessionPayload.facilityId,
      scope: sessionPayload.scope,
    }
  } catch {
    return null
  }
})

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

