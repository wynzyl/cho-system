import { requireSession } from "@/lib/auth"

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  REGISTRATION: "Registration",
  TRIAGE: "Triage",
  DOCTOR: "Doctor",
  LAB: "Laboratory",
  PHARMACY: "Pharmacy",
}

function formatRole(role: string): string {
  return ROLE_LABELS[role] ?? role
}

export default async function ProfilePage() {
  const session = await requireSession()

  return (
    <div>
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="mt-2 text-muted-foreground">
        Manage your account settings
      </p>
      <dl className="mt-6 rounded-lg border bg-card p-6 space-y-4">
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Name</dt>
          <dd className="mt-1">{session.name}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Role</dt>
          <dd className="mt-1">{formatRole(session.role)}</dd>
        </div>
      </dl>
    </div>
  )
}
