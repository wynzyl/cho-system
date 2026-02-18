import { requireSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ROLE_ROUTES } from "@/lib/auth/routes"

// Admin lands on triage by default when visiting /dashboard
const DASHBOARD_LANDING: Record<string, string> = {
  ...ROLE_ROUTES,
  ADMIN: "/dashboard/triage",
}

export default async function DashboardPage() {
  const session = await requireSession()

  // Redirect to role-specific dashboard
  const targetRoute = DASHBOARD_LANDING[session.role]
  if (targetRoute && targetRoute !== "/dashboard") {
    redirect(targetRoute)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome, {session.name}. Role: {session.role}
      </p>
    </div>
  )
}
