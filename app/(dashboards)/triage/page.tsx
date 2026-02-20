import { requireRole } from "@/lib/auth"
import { TriagePageClient } from "@/components/triage/triage-page-client"

export default async function TriagePage() {
  await requireRole(["ADMIN", "TRIAGE"])

  return <TriagePageClient />
}
