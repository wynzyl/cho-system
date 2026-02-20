import { requireRole } from "@/lib/auth"

export default async function AppointmentsPage() {
  const session = await requireRole(["ADMIN", "REGISTRATION", "TRIAGE", "DOCTOR"])

  return (
    <div>
      <h1 className="text-2xl font-bold">Appointments</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome, {session.name}
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Today&apos;s Encounters</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Patients ready for consultation
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Lab Results</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Review pending lab results
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Patient History</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Search patient records
          </p>
        </div>
      </div>
    </div>
  )
}
