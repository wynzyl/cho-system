import { requireRole } from "@/lib/auth"
import { getFacilitiesAction } from "@/actions/users"
import { UsersPageClient } from "@/components/users/users-page-client"

export default async function UsersPage() {
  await requireRole(["ADMIN"])

  const facilitiesResult = await getFacilitiesAction()
  const facilities = facilitiesResult.ok ? facilitiesResult.data : []

  return <UsersPageClient facilities={facilities} />
}
