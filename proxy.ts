import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const SESSION_COOKIE_NAME = "cho-session"

const publicPaths = ["/login", "/"]

const roleRoutes: Record<string, string[]> = {
  ADMIN: [
    "/dashboard",
    "/dashboard/triage",
    "/dashboard/doctor",
    "/dashboard/laboratory",
    "/dashboard/pharmacy",
  ],
  TRIAGE: ["/dashboard", "/dashboard/triage"],
  DOCTOR: ["/dashboard", "/dashboard/doctor"],
  LAB: ["/dashboard", "/dashboard/laboratory"],
  PHARMACY: ["/dashboard", "/dashboard/pharmacy"],
}

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set")
  }
  return new TextEncoder().encode(secret)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some((path) => pathname === path)) {
    return NextResponse.next()
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Allow unauthorized page
  if (pathname === "/unauthorized") {
    return NextResponse.next()
  }

  // Get session token
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    const role = payload.role as string

    // Check role-based access for dashboard routes
    if (pathname.startsWith("/dashboard")) {
      const allowedPaths = roleRoutes[role] ?? []
      const hasAccess = allowedPaths.some(
        (path) => pathname === path || pathname.startsWith(path + "/")
      )

      if (!hasAccess && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", request.url))
      }
    }

    return NextResponse.next()
  } catch {
    // Invalid or expired token
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete(SESSION_COOKIE_NAME)
    return response
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
