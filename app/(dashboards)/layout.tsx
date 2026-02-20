import { requireSession } from "@/lib/auth"
import { getFacilityById } from "@/lib/db/queries"
import { AppNavbar } from "@/components/layout/app-navbar"
import { AppSidebar } from "@/components/layout/app-sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireSession()
  const facility = await getFacilityById(session.facilityId)

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar session={session} facility={facility} />
      <div className="flex">
        <aside className="hidden md:flex w-64 flex-col border-r bg-card fixed inset-y-0 left-0 top-14">
          <AppSidebar role={session.role} />
        </aside>
        <main className="flex-1 md:pl-64 pt-14">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
