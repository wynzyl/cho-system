import { requireRole } from "@/lib/auth"
import { DoctorPageClient } from "@/components/doctor"

export default async function AppointmentsPage() {
  await requireRole(["DOCTOR"])

  return <DoctorPageClient />
}
