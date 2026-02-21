import { requireRole } from "@/lib/auth"
import { AppointmentsPageClient } from "@/components/appointments/appointments-page-client"

export default async function AppointmentsPage() {
  await requireRole(["ADMIN", "DOCTOR"])

  return <AppointmentsPageClient />
}
