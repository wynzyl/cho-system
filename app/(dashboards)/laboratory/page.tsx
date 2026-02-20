import { requireRole } from "@/lib/auth"

export default async function LaboratoryPage() {
  const session = await requireRole(["ADMIN", "LAB"])

  return (
    <div>
      <h1 className="text-2xl font-bold">Laboratory</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome, {session.name}
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Pending Orders</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Lab orders waiting for processing
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">In Progress</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Currently processing
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Released Today</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Results released today
          </p>
        </div>
      </div>
    </div>
  )
}
