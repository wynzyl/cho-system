import { requireRole } from "@/lib/auth"

export default async function PharmacyDashboardPage() {
  const session = await requireRole(["PHARMACY"])

  return (
    <div>
      <h1 className="text-2xl font-bold">Pharmacy Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome, {session.name}
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">To Dispense</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Prescriptions ready for dispensing
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Inventory</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Stock management
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Low Stock Alerts</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Items needing reorder
          </p>
        </div>
      </div>
    </div>
  )
}
