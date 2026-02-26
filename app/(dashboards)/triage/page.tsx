import dynamic from "next/dynamic"
import { requireRole, EDIT_ALLERGIES_ROLES } from "@/lib/auth"

const TriagePageClient = dynamic(
  () =>
    import("@/components/triage/triage-page-client").then((mod) => ({
      default: mod.TriagePageClient,
    })),
  { ssr: true }
)

export default async function TriagePage() {
  const session = await requireRole(["ADMIN", "TRIAGE"])
  const canEditAllergies = EDIT_ALLERGIES_ROLES.includes(session.role)

  return <TriagePageClient canEditAllergies={canEditAllergies} />
}
