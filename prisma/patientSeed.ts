import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Filipino first names
const MALE_FIRST_NAMES = [
  "Juan",
  "Jose",
  "Pedro",
  "Antonio",
  "Carlos",
  "Miguel",
  "Ramon",
  "Francisco",
  "Manuel",
  "Roberto",
  "Eduardo",
  "Ricardo",
  "Alejandro",
  "Fernando",
  "Rafael",
  "Luis",
  "Mario",
  "Enrique",
  "Andres",
  "Leonardo",
]

const FEMALE_FIRST_NAMES = [
  "Maria",
  "Ana",
  "Rosa",
  "Carmen",
  "Luz",
  "Elena",
  "Sofia",
  "Isabella",
  "Gabriela",
  "Patricia",
  "Angela",
  "Cristina",
  "Teresa",
  "Victoria",
  "Cecilia",
  "Beatriz",
  "Margarita",
  "Lorena",
  "Josefina",
  "Dolores",
]

// Filipino surnames (stored UPPERCASE)
const SURNAMES = [
  "SANTOS",
  "REYES",
  "CRUZ",
  "BAUTISTA",
  "OCAMPO",
  "GARCIA",
  "MENDOZA",
  "TORRES",
  "VILLANUEVA",
  "RAMOS",
  "FERNANDEZ",
  "GONZALES",
  "LOPEZ",
  "CASTILLO",
  "RIVERA",
  "AQUINO",
  "FLORES",
  "DE LEON",
  "DELA CRUZ",
  "PASCUAL",
]

// Weighted random selection helper
function weightedRandom<T>(options: { value: T; weight: number }[]): T {
  const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0)
  let random = Math.random() * totalWeight
  for (const option of options) {
    random -= option.weight
    if (random <= 0) {
      return option.value
    }
  }
  return options[options.length - 1].value
}

// Random element from array
function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Generate random birth date within age range
function randomBirthDate(minAge: number, maxAge: number): Date {
  const now = new Date()
  const minYear = now.getFullYear() - maxAge
  const maxYear = now.getFullYear() - minAge
  const year = minYear + Math.floor(Math.random() * (maxYear - minYear + 1))
  const month = Math.floor(Math.random() * 12)
  const day = 1 + Math.floor(Math.random() * 28) // Safe day range
  return new Date(year, month, day)
}

// Calculate age from birth date
function calculateAge(birthDate: Date): number {
  const now = new Date()
  let age = now.getFullYear() - birthDate.getFullYear()
  const monthDiff = now.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

// Generate phone number in 09XX-XXX-XXXX format
function generatePhone(): string {
  const prefixes = ["0917", "0918", "0919", "0920", "0921", "0927", "0928", "0929", "0930", "0939", "0945", "0946"]
  const prefix = randomElement(prefixes)
  const mid = String(Math.floor(Math.random() * 1000)).padStart(3, "0")
  const end = String(Math.floor(Math.random() * 10000)).padStart(4, "0")
  return `${prefix}-${mid}-${end}`
}

// Generate address line
function generateAddressLine(): string | null {
  if (Math.random() < 0.3) return null // 30% chance of no address line

  const houseNo = Math.floor(Math.random() * 500) + 1
  const streets = [
    "Purok 1",
    "Purok 2",
    "Purok 3",
    "Purok 4",
    "Purok 5",
    "Sitio Centro",
    "Sitio Norte",
    "Sitio Sur",
  ]
  return `${houseNo} ${randomElement(streets)}`
}

// Generate civil status based on age
function generateCivilStatus(age: number): "SINGLE" | "MARRIED" | "WIDOWED" | "SEPARATED" {
  if (age < 18) {
    return "SINGLE"
  }

  if (age < 25) {
    return weightedRandom([
      { value: "SINGLE" as const, weight: 70 },
      { value: "MARRIED" as const, weight: 25 },
      { value: "SEPARATED" as const, weight: 5 },
    ])
  }

  return weightedRandom([
    { value: "SINGLE" as const, weight: 25 },
    { value: "MARRIED" as const, weight: 55 },
    { value: "WIDOWED" as const, weight: 12 },
    { value: "SEPARATED" as const, weight: 8 },
  ])
}

// Generate religion with realistic distribution
function generateReligion():
  | "ROMAN_CATHOLIC"
  | "PROTESTANT"
  | "IGLESIA_NI_CRISTO"
  | "ISLAM"
  | "OTHER" {
  return weightedRandom([
    { value: "ROMAN_CATHOLIC" as const, weight: 70 },
    { value: "PROTESTANT" as const, weight: 10 },
    { value: "IGLESIA_NI_CRISTO" as const, weight: 10 },
    { value: "ISLAM" as const, weight: 5 },
    { value: "OTHER" as const, weight: 5 },
  ])
}

// Generate blood type with realistic distribution
function generateBloodType():
  | "O_POSITIVE"
  | "A_POSITIVE"
  | "B_POSITIVE"
  | "AB_POSITIVE"
  | "O_NEGATIVE"
  | "A_NEGATIVE"
  | "B_NEGATIVE"
  | "AB_NEGATIVE"
  | null {
  // 40% chance of unknown blood type
  if (Math.random() < 0.4) return null

  return weightedRandom([
    { value: "O_POSITIVE" as const, weight: 38 },
    { value: "A_POSITIVE" as const, weight: 27 },
    { value: "B_POSITIVE" as const, weight: 22 },
    { value: "AB_POSITIVE" as const, weight: 5 },
    { value: "O_NEGATIVE" as const, weight: 3 },
    { value: "A_NEGATIVE" as const, weight: 3 },
    { value: "B_NEGATIVE" as const, weight: 1 },
    { value: "AB_NEGATIVE" as const, weight: 1 },
  ])
}

// Generate age with distribution: 0-18 (20%), 19-35 (30%), 36-55 (30%), 56+ (20%)
function generateAgeRange(): { min: number; max: number } {
  return weightedRandom([
    { value: { min: 0, max: 18 }, weight: 20 },
    { value: { min: 19, max: 35 }, weight: 30 },
    { value: { min: 36, max: 55 }, weight: 30 },
    { value: { min: 56, max: 80 }, weight: 20 },
  ])
}

interface PatientData {
  patientCode: string
  firstName: string
  middleName: string | null
  lastName: string
  birthDate: Date
  sex: "MALE" | "FEMALE"
  civilStatus: "SINGLE" | "MARRIED" | "WIDOWED" | "SEPARATED"
  religion: "ROMAN_CATHOLIC" | "PROTESTANT" | "IGLESIA_NI_CRISTO" | "ISLAM" | "OTHER"
  bloodType:
    | "O_POSITIVE"
    | "A_POSITIVE"
    | "B_POSITIVE"
    | "AB_POSITIVE"
    | "O_NEGATIVE"
    | "A_NEGATIVE"
    | "B_NEGATIVE"
    | "AB_NEGATIVE"
    | "UNKNOWN"
  phone: string
  barangayId: string
  addressLine: string | null
  allergyStatus: "UNKNOWN"
}

function generatePatient(
  barangayIds: string[],
  patientNumber: number
): PatientData {
  // Generate sex (50/50)
  const sex: "MALE" | "FEMALE" = Math.random() < 0.5 ? "MALE" : "FEMALE"

  // Generate first name based on sex
  const firstName =
    sex === "MALE" ? randomElement(MALE_FIRST_NAMES) : randomElement(FEMALE_FIRST_NAMES)

  // Generate last name
  const lastName = randomElement(SURNAMES)

  // Generate middle name (50% chance)
  const middleName = Math.random() < 0.5 ? randomElement(SURNAMES) : null

  // Generate age and birth date
  const ageRange = generateAgeRange()
  const birthDate = randomBirthDate(ageRange.min, ageRange.max)
  const age = calculateAge(birthDate)

  // Generate civil status based on age
  const civilStatus = generateCivilStatus(age)

  // Generate patient code
  const patientCode = `CHO-2026-${String(patientNumber).padStart(6, "0")}`

  // Generate blood type
  const rawBloodType = generateBloodType()
  const bloodType = rawBloodType ?? "UNKNOWN"

  return {
    patientCode,
    firstName,
    middleName,
    lastName,
    birthDate,
    sex,
    civilStatus,
    religion: generateReligion(),
    bloodType,
    phone: generatePhone(),
    barangayId: randomElement(barangayIds),
    addressLine: generateAddressLine(),
    allergyStatus: "UNKNOWN",
  }
}

async function seedPatients() {
  console.log("Seeding patients...")

  // 1. Fetch barangays
  const barangays = await prisma.barangay.findMany({
    select: { id: true },
  })

  if (barangays.length === 0) {
    console.error("No barangays found. Please run the main seed first.")
    process.exit(1)
  }

  const barangayIds = barangays.map((b) => b.id)
  console.log(`Found ${barangayIds.length} barangays`)

  // 2. Find the last patient code for 2026 to determine starting number
  const lastPatient = await prisma.patient.findFirst({
    where: { patientCode: { startsWith: "CHO-2026-" } },
    orderBy: { patientCode: "desc" },
    select: { patientCode: true },
  })

  let lastNumber = 0
  if (lastPatient) {
    const parts = lastPatient.patientCode.split("-")
    lastNumber = parseInt(parts[2], 10) || 0
  }
  console.log(`Last patient number: ${lastNumber}`)

  // 3. Generate 30 patients
  const patients: PatientData[] = []
  for (let i = 0; i < 30; i++) {
    patients.push(generatePatient(barangayIds, lastNumber + i + 1))
  }

  // 4. Insert patients
  let createdCount = 0
  for (const patient of patients) {
    await prisma.patient.create({
      data: patient,
    })
    createdCount++
  }

  console.log(`Seeded ${createdCount} patients`)

  // 5. Show summary
  const patientStats = await prisma.patient.groupBy({
    by: ["sex"],
    _count: { id: true },
  })

  console.log("\nPatient summary:")
  for (const stat of patientStats) {
    console.log(`  ${stat.sex}: ${stat._count.id}`)
  }
}

seedPatients()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
