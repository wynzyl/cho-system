import { requireRole } from "@/lib/auth"
import { DoctorPageClient } from "@/components/doctor"

export default async function AppointmentsPage() {
  const session = await requireRole(["DOCTOR"])

  return <DoctorPageClient userId={session.userId} />
}
