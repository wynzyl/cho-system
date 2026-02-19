import { redirect } from "next/navigation"
import { requireRole } from "@/lib/auth/guards"

export default async function RegistrationDashboardPage() {
  await requireRole(["REGISTRATION"])
  redirect("/patients")
}
