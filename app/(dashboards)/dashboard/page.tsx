import { requireSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await requireSession()

  // Redirect to role-specific dashboard
  const roleRoutes: Record<string, string> = {
    ADMIN: "/dashboard/triage", // Admin lands on triage by default
    TRIAGE: "/dashboard/triage",
    DOCTOR: "/dashboard/doctor",
    LAB: "/dashboard/laboratory",
    PHARMACY: "/dashboard/pharmacy",
  }

  const targetRoute = roleRoutes[session.role]
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
