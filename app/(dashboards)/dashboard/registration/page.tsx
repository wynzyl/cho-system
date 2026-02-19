import { requireRole } from "@/lib/auth"

export default async function RegistrationDashboardPage() {
  const session = await requireRole(["REGISTRATION"])

  return (
    <div>
      <h1 className="text-2xl font-bold">Registration Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome, {session.name}
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Patient Search</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Search for existing patients
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">New Patient</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Register a new patient
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Start Encounter</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a new patient visit
          </p>
        </div>
      </div>
    </div>
  )
}
