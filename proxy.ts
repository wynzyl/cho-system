import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"
import { SESSION_COOKIE_NAME, getSecretKey } from "@/lib/auth/session"
import { ROLE_ALLOWED_PATHS } from "@/lib/auth/routes"

const publicPaths = ["/login", "/"]

// Known static file extensions that should bypass auth
const STATIC_EXTENSIONS = [".ico", ".png", ".jpg", ".jpeg", ".svg", ".css", ".js", ".woff", ".woff2"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some((path) => pathname === path)) {
    return NextResponse.next()
  }

  // Allow Next.js internals and API routes
  if (pathname.startsWith("/_next") || pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Allow known static file extensions
  if (STATIC_EXTENSIONS.some((ext) => pathname.endsWith(ext))) {
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
      // ADMIN has access to all dashboard routes
      if (role === "ADMIN") {
        return NextResponse.next()
      }

      const allowedPaths = ROLE_ALLOWED_PATHS[role as keyof typeof ROLE_ALLOWED_PATHS] ?? []
      const hasAccess = allowedPaths.some(
        (path) => pathname === path || pathname.startsWith(path + "/")
      )

      if (!hasAccess) {
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
