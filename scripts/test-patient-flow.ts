/**
 * Test Patient Flow Script
 *
 * Creates a complete patient flow for Rustom Gonzalez with Dengue Fever diagnosis:
 * 1. Patient Registration
 * 2. Triage Assessment (Dengue symptoms)
 * 3. Doctor Consultation with Diagnosis
 *
 * Run with: npx tsx scripts/test-patient-flow.ts
 */

import "dotenv/config"
import { PrismaClient, Prisma } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

// Use Prisma.Decimal for Decimal types
const Decimal = Prisma.Decimal

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("=".repeat(60))
  console.log("TEST PATIENT FLOW: Rustom Gonzalez - Dengue Fever")
  console.log("=".repeat(60))

  // -------------------------------------------------------
  // FETCH REQUIRED REFERENCES
  // -------------------------------------------------------

  // Get Poblacion barangay
  const poblacionBarangay = await prisma.barangay.findFirst({
    where: { code: "POBLACION" },
  })
  if (!poblacionBarangay) {
    throw new Error("Barangay POBLACION not found. Run `npx prisma db seed` first.")
  }
  console.log(`[REF] Barangay: ${poblacionBarangay.name} (${poblacionBarangay.id})`)

  // Get main facility
  const mainFacility = await prisma.facility.findFirst({
    where: { code: "CHO-MAIN" },
  })
  if (!mainFacility) {
    throw new Error("Facility CHO-MAIN not found. Run `npx prisma db seed` first.")
  }
  console.log(`[REF] Facility: ${mainFacility.name} (${mainFacility.id})`)

  // Get triage user
  const triageUser = await prisma.user.findFirst({
    where: { role: "TRIAGE", facilityId: mainFacility.id },
  })
  if (!triageUser) {
    throw new Error("Triage user not found for main facility.")
  }
  console.log(`[REF] Triage Nurse: ${triageUser.name} (${triageUser.id})`)

  // Get doctor user
  const doctorUser = await prisma.user.findFirst({
    where: { role: "DOCTOR", facilityId: mainFacility.id },
  })
  if (!doctorUser) {
    throw new Error("Doctor not found for main facility.")
  }
  console.log(`[REF] Doctor: ${doctorUser.name} (${doctorUser.id})`)

  // Get Dengue subcategory
  const dengueSubcategory = await prisma.diagnosisSubcategory.findFirst({
    where: { code: "DENGUE" },
    include: { icdMappings: true },
  })
  if (!dengueSubcategory) {
    throw new Error("Dengue subcategory not found. Run `npx prisma db seed` first.")
  }
  console.log(`[REF] Diagnosis: ${dengueSubcategory.name} (ICD-10: ${dengueSubcategory.icdMappings[0]?.icd10Code})`)

  console.log("\n" + "-".repeat(60))

  // -------------------------------------------------------
  // STEP 1: CREATE PATIENT
  // -------------------------------------------------------

  console.log("\n[STEP 1] Creating patient: Rustom Gonzalez")

  // Generate unique patient code with timestamp
  const patientCode = `PAT-${Date.now().toString(36).toUpperCase()}`

  const patient = await prisma.patient.create({
    data: {
      patientCode,
      firstName: "Rustom",
      middleName: "Santos",
      lastName: "Gonzalez",
      birthDate: new Date("2019-08-20"),
      sex: "MALE",
      civilStatus: "SINGLE",
      phone: "09171234567",
      barangayId: poblacionBarangay.id,
      addressLine: "123 Sample Street",
      city: "Urdaneta City",
      province: "Pangasinan",
      bloodType: "O_POSITIVE",
      allergyStatus: "NKA", // No Known Allergies confirmed
      allergyConfirmedAt: new Date(),
    },
  })

  console.log(`  > Patient created: ${patient.firstName} ${patient.lastName}`)
  console.log(`  > Patient ID: ${patient.id}`)
  console.log(`  > Patient Code: ${patient.patientCode}`)
  console.log(`  > DOB: ${patient.birthDate.toISOString().split("T")[0]}`)
  console.log(`  > Age: ~${new Date().getFullYear() - 2019} years old`)

  // -------------------------------------------------------
  // STEP 2: CREATE ENCOUNTER (WAIT_TRIAGE)
  // -------------------------------------------------------

  console.log("\n[STEP 2] Creating encounter with WAIT_TRIAGE status")

  const encounter = await prisma.encounter.create({
    data: {
      patientId: patient.id,
      facilityId: mainFacility.id,
      status: "WAIT_TRIAGE",
      occurredAt: new Date(),
    },
  })

  console.log(`  > Encounter created: ${encounter.id}`)
  console.log(`  > Status: ${encounter.status}`)
  console.log(`  > Facility: ${mainFacility.name}`)

  // -------------------------------------------------------
  // STEP 3: SUBMIT TRIAGE (Dengue Symptoms)
  // -------------------------------------------------------

  console.log("\n[STEP 3] Submitting triage with dengue symptoms")

  // Create triage record
  const triageRecord = await prisma.triageRecord.create({
    data: {
      encounterId: encounter.id,
      // Vitals typical for pediatric dengue
      temperatureC: new Decimal(39.2), // High fever
      heartRate: 110, // Tachycardia
      respiratoryRate: 24,
      bpSystolic: 90,
      bpDiastolic: 60,
      weightKg: new Decimal(20),
      heightCm: new Decimal(115),
      spo2: 97,
      // HPI Screening
      symptomOnset: "3 days ago",
      symptomDuration: "3 days",
      painSeverity: 6,
      associatedSymptoms: ["headache", "body aches", "rash", "loss of appetite"],
      // Exposure Flags
      exposureFlags: ["dengue_area"],
      exposureNotes: "Patient from barangay with recent dengue cases",
      notes: "Pediatric patient presenting with classic dengue symptoms",
      recordedById: triageUser.id,
      recordedAt: new Date(),
    },
  })

  console.log(`  > Triage Record ID: ${triageRecord.id}`)
  console.log(`  > Temperature: ${triageRecord.temperatureC}°C (FEBRILE)`)
  console.log(`  > Heart Rate: ${triageRecord.heartRate} bpm`)
  console.log(`  > BP: ${triageRecord.bpSystolic}/${triageRecord.bpDiastolic} mmHg`)
  console.log(`  > SpO2: ${triageRecord.spo2}%`)
  console.log(`  > Symptoms: ${triageRecord.associatedSymptoms.join(", ")}`)
  console.log(`  > Exposure Flags: ${triageRecord.exposureFlags.join(", ")}`)

  // Update encounter to WAIT_DOCTOR
  await prisma.encounter.update({
    where: { id: encounter.id },
    data: {
      status: "WAIT_DOCTOR",
      chiefComplaint: "High fever for 3 days with body aches and rash",
      triageNotes: "Possible dengue case. Patient from dengue endemic area. Monitor for warning signs.",
      triageById: triageUser.id,
    },
  })

  console.log(`  > Encounter status updated: WAIT_TRIAGE → WAIT_DOCTOR`)
  console.log(`  > Chief Complaint: High fever for 3 days with body aches and rash`)

  // -------------------------------------------------------
  // STEP 4: START DOCTOR CONSULTATION
  // -------------------------------------------------------

  console.log("\n[STEP 4] Starting doctor consultation")

  await prisma.encounter.update({
    where: { id: encounter.id },
    data: {
      status: "IN_CONSULT",
      doctorId: doctorUser.id,
      consultStartedAt: new Date(),
    },
  })

  console.log(`  > Encounter status: WAIT_DOCTOR → IN_CONSULT`)
  console.log(`  > Assigned Doctor: ${doctorUser.name}`)
  console.log(`  > Consultation started at: ${new Date().toISOString()}`)

  // -------------------------------------------------------
  // STEP 5: ADD DIAGNOSIS - DENGUE FEVER
  // -------------------------------------------------------

  console.log("\n[STEP 5] Adding diagnosis: Dengue Fever (A90)")

  const diagnosis = await prisma.diagnosis.create({
    data: {
      encounterId: encounter.id,
      text: "Dengue Fever",
      subcategoryId: dengueSubcategory.id,
      createdById: doctorUser.id,
    },
  })

  console.log(`  > Diagnosis ID: ${diagnosis.id}`)
  console.log(`  > Diagnosis Text: ${diagnosis.text}`)
  console.log(`  > Subcategory: ${dengueSubcategory.name}`)
  console.log(`  > ICD-10: ${dengueSubcategory.icdMappings[0]?.icd10Code} - ${dengueSubcategory.icdMappings[0]?.icdTitle}`)
  console.log(`  > Notifiable Disease: ${dengueSubcategory.isNotifiable ? "YES" : "NO"}`)

  // Update encounter with clinical documentation
  await prisma.encounter.update({
    where: { id: encounter.id },
    data: {
      hpiDoctorNotes: {
        character: "Continuous high-grade fever reaching 39.2°C",
        location: "Generalized body aches, particularly in joints and muscles",
        radiation: "N/A",
        aggravating: "Activity worsens body aches",
        relieving: "Rest and paracetamol provide temporary relief",
        additionalNotes: "Petechial rash noted on extremities. No bleeding manifestations.",
      },
      physicalExamData: {
        version: 1,
        general: {
          findings: ["febrile", "weak", "alert"],
          notes: "Child appears ill but conscious and responsive",
        },
        heent: {
          findings: ["conjunctival_injection"],
          notes: "Mild conjunctival injection bilaterally",
        },
        skin: {
          findings: ["petechiae", "rash"],
          notes: "Petechial rash on both arms and legs. Tourniquet test positive.",
        },
        abdomen: {
          findings: ["tender_RUQ"],
          notes: "Mild right upper quadrant tenderness. No hepatomegaly palpated.",
        },
        extremities: {
          findings: ["no_edema"],
          notes: "No peripheral edema. Capillary refill < 2 seconds.",
        },
      },
      clinicalImpression:
        "Dengue Fever - Classic presentation with high-grade fever, body aches, headache, and petechial rash. Tourniquet test positive. Currently no warning signs. Day 3 of illness - entering critical phase monitoring period.",
    },
  })

  console.log(`  > HPI Doctor Notes: Added`)
  console.log(`  > Physical Exam: Documented`)
  console.log(`  > Clinical Impression: Dengue Fever - Classic presentation`)

  // -------------------------------------------------------
  // STEP 6: COMPLETE CONSULTATION
  // -------------------------------------------------------

  console.log("\n[STEP 6] Completing consultation")

  const followUpDate = new Date()
  followUpDate.setDate(followUpDate.getDate() + 3)

  await prisma.encounter.update({
    where: { id: encounter.id },
    data: {
      status: "DONE",
      consultEndedAt: new Date(),
      adviceData: {
        version: 1,
        instructions: [
          "Increase oral fluid intake - aim for 2-3 liters daily",
          "Paracetamol 250mg every 6 hours for fever (AVOID NSAIDs/Aspirin)",
          "Complete bed rest",
          "Monitor temperature every 4 hours",
          "Monitor for warning signs: persistent vomiting, severe abdominal pain, bleeding, restlessness",
          "Return immediately if warning signs develop",
        ],
        followUpDate: followUpDate.toISOString().split("T")[0],
        followUpNotes: "Return in 3 days for CBC monitoring and clinical assessment. If warning signs develop, bring to hospital immediately.",
      },
    },
  })

  console.log(`  > Encounter status: IN_CONSULT → DONE`)
  console.log(`  > Consultation ended at: ${new Date().toISOString()}`)
  console.log(`  > Follow-up date: ${followUpDate.toISOString().split("T")[0]}`)

  // -------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------

  console.log("\n" + "=".repeat(60))
  console.log("TEST PATIENT FLOW COMPLETED SUCCESSFULLY")
  console.log("=".repeat(60))

  console.log("\nSUMMARY:")
  console.log(`  Patient: ${patient.firstName} ${patient.lastName}`)
  console.log(`  Patient Code: ${patient.patientCode}`)
  console.log(`  Patient ID: ${patient.id}`)
  console.log(`  Encounter ID: ${encounter.id}`)
  console.log(`  Diagnosis: Dengue Fever (A90)`)
  console.log(`  Status: DONE`)

  console.log("\nVERIFICATION STEPS:")
  console.log("  1. Open /patients - Search for 'Rustom Gonzalez'")
  console.log("  2. Open patient detail - View encounter history")
  console.log("  3. Open /appointments - Check completed consultations")
  console.log("  4. Verify diagnosis linked to Dengue subcategory")

  console.log("\n" + "=".repeat(60))
}

main()
  .catch((e) => {
    console.error("ERROR:", e)
    process.exit(1)
  })
  .finally(async () => {
    await pool.end()
    await prisma.$disconnect()
  })
