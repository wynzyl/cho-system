import dynamic from "next/dynamic"
import { requireRole } from "@/lib/auth"

const TriagePageClient = dynamic(
  () =>
    import("@/components/triage/triage-page-client").then((mod) => ({
      default: mod.TriagePageClient,
    })),
  { ssr: true }
)

export default async function TriagePage() {
  const session = await requireRole(["ADMIN", "TRIAGE"])
  const canEditAllergies = ["REGISTRATION", "TRIAGE", "DOCTOR", "ADMIN"].includes(session.role)

  return <TriagePageClient canEditAllergies={canEditAllergies} />
}
