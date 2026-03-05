import { LoginForm } from "./login-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { ROLE_ROUTES } from "@/lib/auth/routes"

export const metadata = {
  title: "Login - CHO System",
  description: "City Health Office System Login",
}

export default async function LoginPage() {
  // Redirect if already logged in — but verify user still exists in DB first.
  // Without this check, a stale JWT (e.g. after a DB reseed) causes an infinite
  // redirect loop: requireSession() on protected pages redirects here, and this
  // page redirects back without realising the user no longer exists.
  const session = await getSession()
  if (session) {
    const dbUser = await db.user.findFirst({
      where: { id: session.userId, deletedAt: null, isActive: true },
      select: { id: true },
    })
    if (dbUser) {
      redirect(ROLE_ROUTES[session.role] ?? "/dashboard")
    }
    // Stale JWT — fall through and render the login form.
    // The old cookie will be overwritten when the user logs in again.
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">CHO System</CardTitle>
        <CardDescription>
          Enter your credentials to access the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  )
}
