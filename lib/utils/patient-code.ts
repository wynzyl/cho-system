import { db } from "@/lib/db"
import type { Prisma } from "@prisma/client"

type TransactionClient = Prisma.TransactionClient

export async function generatePatientCode(
  tx?: TransactionClient
): Promise<string> {
  const client = tx ?? db
  const year = new Date().getFullYear()
  const prefix = `CHO-${year}-`

  const lastPatient = await client.patient.findFirst({
    where: { patientCode: { startsWith: prefix } },
    orderBy: { patientCode: "desc" },
    select: { patientCode: true },
  })

  let sequence = 1
  if (lastPatient) {
    const lastSeq = parseInt(lastPatient.patientCode.split("-")[2], 10)
    sequence = lastSeq + 1
  }

  return `${prefix}${sequence.toString().padStart(6, "0")}`
}
