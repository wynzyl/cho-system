import { requireSession } from "@/lib/auth"

export default async function ChangePasswordPage() {
  await requireSession()

  return (
    <div>
      <h1 className="text-2xl font-bold">Change Password</h1>
      <p className="mt-2 text-muted-foreground">
        Update your account password
      </p>
      <div className="mt-6 rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Password change functionality will be implemented here.
        </p>
      </div>
    </div>
  )
}
