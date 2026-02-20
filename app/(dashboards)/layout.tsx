import { requireSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { AppNavbar } from "@/components/layout/app-navbar"
import { AppSidebar } from "@/components/layout/app-sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireSession()
  const facility = await db.facility.findUnique({
    where: { id: session.facilityId },
    select: { code: true, name: true },
  })

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
