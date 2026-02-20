import { requireRole } from "@/lib/auth"

export default async function UsersPage() {
  await requireRole(["ADMIN"])

  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="mt-2 text-muted-foreground">
        Manage system users and their access
      </p>
      <div className="mt-6 rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          User management functionality will be implemented here.
        </p>
      </div>
    </div>
  )
}
