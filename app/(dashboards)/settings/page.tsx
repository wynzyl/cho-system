import { requireRole } from "@/lib/auth"

export default async function SettingsPage() {
  await requireRole(["ADMIN"])

  return (
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-2 text-muted-foreground">
        System configuration and preferences
      </p>
      <div className="mt-6 rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Settings functionality will be implemented here.
        </p>
      </div>
    </div>
  )
}
