import { db } from "@/lib/db"

export async function getFacilityById(facilityId: string) {
  return db.facility.findUnique({
    where: { id: facilityId },
    select: { code: true, name: true },
  })
}
