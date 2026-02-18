import { requireSession } from "@/lib/auth"
import { LogoutButton } from "./logout-button"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireSession()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <span className="font-semibold">CHO System</span>
            <span className="text-sm text-muted-foreground">
              {session.role}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{session.name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
