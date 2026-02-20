import { requireSession } from "@/lib/auth"

export default async function ProfilePage() {
  const session = await requireSession()

  return (
    <div>
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="mt-2 text-muted-foreground">
        Manage your account settings
      </p>
      <div className="mt-6 rounded-lg border bg-card p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Name</label>
          <p className="mt-1">{session.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Role</label>
          <p className="mt-1">{session.role}</p>
        </div>
      </div>
    </div>
  )
}
