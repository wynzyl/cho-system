import { requireRole } from "@/lib/auth/guards"
import { PatientsView } from "./patients-view"

export default async function PatientsPage() {
  const session = await requireRole(["REGISTRATION", "TRIAGE", "ADMIN"])
  return <PatientsView role={session.role} />
}
