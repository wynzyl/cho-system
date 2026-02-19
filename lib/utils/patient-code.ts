import { db } from "@/lib/db"

export async function generatePatientCode(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `CHO-${year}-`

  const lastPatient = await db.patient.findFirst({
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
