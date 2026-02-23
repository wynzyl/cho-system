import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcrypt"
import {
  BARANGAY_DATA,
  DIAGNOSIS_CATEGORIES,
  DIAGNOSIS_SUBCATEGORIES,
} from "@/lib/constants"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database...")

  /*
    -------------------------------------------------------
    CLEAN UP (Safe reset for development only)
    -------------------------------------------------------
  */

  await prisma.user.deleteMany()
  await prisma.facility.deleteMany()
  await prisma.barangay.deleteMany()

  /*
    -------------------------------------------------------
    BARANGAYS (Urdaneta City - 34 total)
    -------------------------------------------------------
  */

  console.log("Seeding barangays...")
  for (const brgy of BARANGAY_DATA) {
    await prisma.barangay.upsert({
      where: { code: brgy.code },
      update: { name: brgy.name },
      create: {
        code: brgy.code,
        name: brgy.name,
      },
    })
  }
  console.log(`Seeded ${BARANGAY_DATA.length} barangays`)

  /*
    -------------------------------------------------------
    FACILITIES (Multi-Facility Architecture)
    -------------------------------------------------------
  */

  const mainFacility = await prisma.facility.create({
    data: {
      code: "CHO-MAIN",
      name: "Urdaneta CHO - Main",
      type: "MAIN",
      address: "Urdaneta City Proper",
      isActive: true,
    },
  })

  const barangay1 = await prisma.facility.create({
    data: {
      code: "CHO-BRG1",
      name: "CHO1 - Barangay Branch",
      type: "BARANGAY",
      address: "Barangay 1",
      isActive: true,
    },
  })

  const barangay2 = await prisma.facility.create({
    data: {
      code: "CHO-BRG2",
      name: "CHO2 - Barangay Branch",
      type: "BARANGAY",
      address: "Barangay 2",
      isActive: true,
    },
  })

  /*
    -------------------------------------------------------
    PASSWORD (Same for dev only)
    -------------------------------------------------------
  */

  const defaultPasswordHash = await bcrypt.hash("Password123!", 10)

  /*
    -------------------------------------------------------
    USERS (Role is an enum, not a separate model)
    -------------------------------------------------------
  */

  // ADMIN (Main Only)
  await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@cho.local",
      passwordHash: defaultPasswordHash,
      role: "ADMIN",
      scope: "CITY_WIDE",
      facilityId: mainFacility.id,
      isActive: true,
    },
  })

  // DOCTORS
  await prisma.user.createMany({
    data: [
      {
        name: "Dr. Santos",
        email: "doctor.main@cho.local",
        passwordHash: defaultPasswordHash,
        role: "DOCTOR",
        facilityId: mainFacility.id,
        isActive: true,
      },
      {
        name: "Dr. Reyes",
        email: "doctor.brgy1@cho.local",
        passwordHash: defaultPasswordHash,
        role: "DOCTOR",
        facilityId: barangay1.id,
        isActive: true,
      },
    ],
  })

  // TRIAGE
  await prisma.user.createMany({
    data: [
      {
        name: "Nurse Maria",
        email: "triage.main@cho.local",
        passwordHash: defaultPasswordHash,
        role: "TRIAGE",
        facilityId: mainFacility.id,
        isActive: true,
      },
      {
        name: "Nurse Ana",
        email: "triage.brgy2@cho.local",
        passwordHash: defaultPasswordHash,
        role: "TRIAGE",
        facilityId: barangay2.id,
        isActive: true,
      },
    ],
  })

  // LAB (MAIN ONLY)
  await prisma.user.create({
    data: {
      name: "Lab Tech Cruz",
      email: "lab@cho.local",
      passwordHash: defaultPasswordHash,
      role: "LAB",
      facilityId: mainFacility.id,
      isActive: true,
    },
  })

  // PHARMACY
  await prisma.user.create({
    data: {
      name: "Pharma Lopez",
      email: "pharmacy@cho.local",
      passwordHash: defaultPasswordHash,
      role: "PHARMACY",
      facilityId: mainFacility.id,
      isActive: true,
    },
  })

  // REGISTRATION
  await prisma.user.create({
    data: {
      name: "Registration Staff",
      email: "registration@cho.local",
      passwordHash: defaultPasswordHash,
      role: "REGISTRATION",
      scope: "FACILITY_ONLY",
      facilityId: mainFacility.id,
      isActive: true,
    },
  })

  /*
    -------------------------------------------------------
    DIAGNOSIS TAXONOMY (Categories → Subcategories → ICD-10 Mappings)
    -------------------------------------------------------
  */

  // Clean up existing taxonomy data
  await prisma.diagnosisIcdMap.deleteMany()
  await prisma.diagnosisSubcategory.deleteMany()
  await prisma.diagnosisCategory.deleteMany()

  console.log("Seeding diagnosis categories...")

  // Create a map to store category IDs by code
  const categoryIdMap = new Map<string, string>()

  for (const category of DIAGNOSIS_CATEGORIES) {
    const created = await prisma.diagnosisCategory.create({
      data: {
        code: category.code,
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
        isActive: true,
      },
    })
    categoryIdMap.set(category.code, created.id)
  }
  console.log(`Seeded ${DIAGNOSIS_CATEGORIES.length} diagnosis categories`)

  console.log("Seeding diagnosis subcategories and ICD-10 mappings...")

  let subcategoryCount = 0
  let icdMappingCount = 0

  for (const subcategory of DIAGNOSIS_SUBCATEGORIES) {
    const categoryId = categoryIdMap.get(subcategory.categoryCode)
    if (!categoryId) {
      console.warn(
        `Category not found for subcategory ${subcategory.code}: ${subcategory.categoryCode}`
      )
      continue
    }

    const createdSubcategory = await prisma.diagnosisSubcategory.create({
      data: {
        categoryId,
        code: subcategory.code,
        name: subcategory.name,
        description: subcategory.description,
        isNotifiable: subcategory.isNotifiable,
        isAnimalBite: subcategory.isAnimalBite,
        sortOrder: subcategory.sortOrder,
        isActive: true,
      },
    })
    subcategoryCount++

    // Create ICD-10 mappings for this subcategory
    for (const icdMapping of subcategory.icdMappings) {
      await prisma.diagnosisIcdMap.create({
        data: {
          subcategoryId: createdSubcategory.id,
          icd10Code: icdMapping.icd10Code,
          icdTitle: icdMapping.icdTitle,
          isDefault: icdMapping.isDefault,
          isActive: true,
        },
      })
      icdMappingCount++
    }
  }

  console.log(`Seeded ${subcategoryCount} diagnosis subcategories`)
  console.log(`Seeded ${icdMappingCount} ICD-10 mappings`)

  console.log("Seeding completed successfully.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })