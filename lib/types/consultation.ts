/**
 * TypeScript interfaces for consultation-related JSON fields
 * Used in Patient, TriageRecord, and Encounter models
 */

// ============================================================================
// PATIENT MEDICAL BACKGROUND (Persistent)
// ============================================================================

export interface MedicalHistoryData {
  version: number // For future schema evolution
  conditions: ChronicConditionEntry[]
  surgeries: SurgeryEntry[]
  currentMedications: MedicationEntry[]
  immunizations: ImmunizationEntry[]
}

export interface ChronicConditionEntry {
  code: string // Maps to DIAGNOSIS_SUBCATEGORIES code (e.g., "HYPERTENSION")
  name: string
  diagnosedYear?: number
  notes?: string
  isActive: boolean
}

export interface SurgeryEntry {
  procedure: string
  year?: number
  notes?: string
}

export interface MedicationEntry {
  name: string
  dosage?: string
  frequency?: string
  forCondition?: string
}

export interface ImmunizationEntry {
  vaccine: string
  dateGiven?: string // ISO date string
  notes?: string
}

export interface FamilyHistoryData {
  version: number
  diabetes: FamilyHistoryEntry
  hypertension: FamilyHistoryEntry
  cancer: FamilyHistoryEntry
  heartDisease: FamilyHistoryEntry
  stroke: FamilyHistoryEntry
  asthma: FamilyHistoryEntry
  mentalIllness: FamilyHistoryEntry
  kidneyDisease: FamilyHistoryEntry
  other?: string
}

export interface FamilyHistoryEntry {
  present: boolean
  relation?: string // "mother", "father", "sibling", "grandparent"
  notes?: string
}

export interface SocialHistoryData {
  version: number
  exposureHistory: ExposureHistoryEntry[]
  occupationalHazards?: string
  livingConditions?: string
  other?: string
}

export interface ExposureHistoryEntry {
  type: string // Maps to EXPOSURE_FLAGS
  date?: string // ISO date string
  details?: string
}

// ============================================================================
// HPI DOCTOR NOTES (Per-Encounter)
// ============================================================================

export interface HpiDoctorNotes {
  version: number
  character?: string // "sharp", "dull", "throbbing", "cramping"
  location?: string // Specific body location
  radiation?: string // Where pain radiates to
  aggravating?: string[] // Factors that worsen symptoms
  relieving?: string[] // Factors that relieve symptoms
  timing?: string // When symptoms occur (e.g., "after meals", "at night")
  previousEpisodes?: string
  treatmentsTried?: string
  additionalNotes?: string
}

// ============================================================================
// PHYSICAL EXAMINATION (Per-Encounter, Doctor Only)
// ============================================================================

export interface PhysicalExamData {
  version: number
  general?: PhysicalExamSection
  heent?: PhysicalExamSection
  chest?: PhysicalExamSection
  cardiovascular?: PhysicalExamSection
  abdomen?: PhysicalExamSection
  skin?: PhysicalExamSection
  extremities?: PhysicalExamSection
  neurologic?: PhysicalExamSection
}

export interface PhysicalExamSection {
  findings: string[] // Selected findings from options
  notes?: string // Free text for additional findings
  isNormal?: boolean // Quick toggle for "Normal" finding
}

// ============================================================================
// PROCEDURES DATA (Per-Encounter)
// ============================================================================

export interface ProceduresData {
  version: number
  procedures: ProcedureEntry[]
}

export interface ProcedureEntry {
  code: string // Maps to COMMON_PROCEDURES
  name: string
  notes?: string
  performedAt?: string // ISO timestamp
}

// ============================================================================
// ADVICE DATA (Per-Encounter)
// ============================================================================

export interface AdviceData {
  version: number
  instructions: string[] // List of advice given
  customInstructions?: string // Free text for additional advice
  followUpDate?: string // ISO date string
  followUpNotes?: string
  referral?: ReferralInfo
}

export interface ReferralInfo {
  facility?: string
  department?: string
  reason?: string
  urgency?: "routine" | "urgent" | "emergency"
}

// ============================================================================
// DEFAULT INITIALIZERS
// ============================================================================

export function createDefaultMedicalHistoryData(): MedicalHistoryData {
  return {
    version: 1,
    conditions: [],
    surgeries: [],
    currentMedications: [],
    immunizations: [],
  }
}

export function createDefaultFamilyHistoryData(): FamilyHistoryData {
  return {
    version: 1,
    diabetes: { present: false },
    hypertension: { present: false },
    cancer: { present: false },
    heartDisease: { present: false },
    stroke: { present: false },
    asthma: { present: false },
    mentalIllness: { present: false },
    kidneyDisease: { present: false },
  }
}

export function createDefaultSocialHistoryData(): SocialHistoryData {
  return {
    version: 1,
    exposureHistory: [],
  }
}

export function createDefaultHpiDoctorNotes(): HpiDoctorNotes {
  return {
    version: 1,
  }
}

export function createDefaultPhysicalExamData(): PhysicalExamData {
  return {
    version: 1,
  }
}

export function createDefaultProceduresData(): ProceduresData {
  return {
    version: 1,
    procedures: [],
  }
}

export function createDefaultAdviceData(): AdviceData {
  return {
    version: 1,
    instructions: [],
  }
}
