import { requireRole } from "@/lib/auth"

export default async function TriageDashboardPage() {
  const session = await requireRole(["TRIAGE"])

  return (
    <div>
      <h1 className="text-2xl font-bold">Triage Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome, {session.name}
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Patient Search</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Find or register patients
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Today&apos;s Queue</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Encounters waiting for triage
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">New Encounter</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Start a new patient visit
          </p>
        </div>
      </div>
    </div>
  )
}
