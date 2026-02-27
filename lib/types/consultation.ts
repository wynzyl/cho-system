/**
 * TypeScript interfaces for JSON structures used in consultation workflow
 * These types match the JSON columns in Prisma schema
 */

// =============================================================================
// PATIENT MEDICAL HISTORY (Patient.medicalHistoryData)
// =============================================================================

export interface ChronicConditionEntry {
  code: string // e.g., "HYPERTENSION", "DM_TYPE2"
  name: string
  diagnosedYear?: number
  isControlled?: boolean
  notes?: string
}

export interface SurgeryEntry {
  name: string
  year?: number
  notes?: string
}

export interface MedicationEntry {
  name: string
  dosage?: string
  frequency?: string
  purpose?: string
}

export interface ImmunizationEntry {
  name: string
  date?: string
  notes?: string
}

export interface MedicalHistoryData {
  version: number // For schema evolution
  conditions: ChronicConditionEntry[]
  surgeries: SurgeryEntry[]
  currentMedications: MedicationEntry[]
  immunizations: ImmunizationEntry[]
}

// =============================================================================
// FAMILY HISTORY (Patient.familyHistoryData)
// =============================================================================

export interface FamilyHistoryItem {
  present: boolean
  relation?: string // "Father", "Mother", "Sibling", etc.
  notes?: string
}

export interface FamilyHistoryData {
  version: number
  diabetes?: FamilyHistoryItem
  hypertension?: FamilyHistoryItem
  cancer?: FamilyHistoryItem
  heartDisease?: FamilyHistoryItem
  stroke?: FamilyHistoryItem
  asthma?: FamilyHistoryItem
  mentalHealth?: FamilyHistoryItem
  other?: string
}

// =============================================================================
// SOCIAL HISTORY (Patient.socialHistoryData)
// =============================================================================

export interface ExposureHistoryEntry {
  type: string // "animal_bite", "flood_exposure", etc.
  date?: string
  details?: string
}

export interface SocialHistoryData {
  version: number
  occupationDetails?: string
  exposureHistory: ExposureHistoryEntry[]
  other?: string
}

// =============================================================================
// HPI DOCTOR NOTES (Encounter.hpiDoctorNotes)
// =============================================================================

export interface HpiDoctorNotes {
  character?: string // "Sharp", "Dull", "Throbbing", etc.
  location?: string // Body part
  radiation?: string // Does pain radiate?
  aggravating?: string // What makes it worse?
  relieving?: string // What makes it better?
  additionalNotes?: string
}

// =============================================================================
// PHYSICAL EXAMINATION (Encounter.physicalExamData)
// =============================================================================

export interface BodySystemExam {
  findings: string[] // Array of finding codes/values
  notes?: string
}

export interface PhysicalExamData {
  version: number
  general?: BodySystemExam
  heent?: BodySystemExam
  chest?: BodySystemExam
  cardiovascular?: BodySystemExam
  abdomen?: BodySystemExam
  skin?: BodySystemExam
  extremities?: BodySystemExam
  neurologic?: BodySystemExam
}

// =============================================================================
// PROCEDURES (Encounter.proceduresData)
// =============================================================================

export interface ProcedureEntry {
  code: string // e.g., "wound_cleaning", "suturing"
  name: string
  notes?: string
}

export interface ProceduresData {
  version: number
  procedures: ProcedureEntry[]
}

// =============================================================================
// ADVICE AND FOLLOW-UP (Encounter.adviceData)
// =============================================================================

export interface AdviceData {
  version: number
  instructions: string[]
  followUpDate?: string // ISO date string
  followUpNotes?: string
  referral?: string
}

// =============================================================================
// HELPER TYPE GUARDS
// =============================================================================

export function isMedicalHistoryData(data: unknown): data is MedicalHistoryData {
  if (!data || typeof data !== "object") return false
  const d = data as MedicalHistoryData
  return (
    typeof d.version === "number" &&
    Array.isArray(d.conditions) &&
    Array.isArray(d.surgeries) &&
    Array.isArray(d.currentMedications) &&
    Array.isArray(d.immunizations)
  )
}

export function isFamilyHistoryData(data: unknown): data is FamilyHistoryData {
  if (!data || typeof data !== "object") return false
  const d = data as FamilyHistoryData
  return typeof d.version === "number"
}

export function isSocialHistoryData(data: unknown): data is SocialHistoryData {
  if (!data || typeof data !== "object") return false
  const d = data as SocialHistoryData
  return typeof d.version === "number" && Array.isArray(d.exposureHistory)
}

export function isPhysicalExamData(data: unknown): data is PhysicalExamData {
  if (!data || typeof data !== "object") return false
  const d = data as PhysicalExamData
  return typeof d.version === "number"
}

export function isProceduresData(data: unknown): data is ProceduresData {
  if (!data || typeof data !== "object") return false
  const d = data as ProceduresData
  return typeof d.version === "number" && Array.isArray(d.procedures)
}

export function isAdviceData(data: unknown): data is AdviceData {
  if (!data || typeof data !== "object") return false
  const d = data as AdviceData
  return typeof d.version === "number" && Array.isArray(d.instructions)
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const defaultMedicalHistoryData: MedicalHistoryData = {
  version: 1,
  conditions: [],
  surgeries: [],
  currentMedications: [],
  immunizations: [],
}

export const defaultFamilyHistoryData: FamilyHistoryData = {
  version: 1,
}

export const defaultSocialHistoryData: SocialHistoryData = {
  version: 1,
  exposureHistory: [],
}

export const defaultPhysicalExamData: PhysicalExamData = {
  version: 1,
}

export const defaultProceduresData: ProceduresData = {
  version: 1,
  procedures: [],
}

export const defaultAdviceData: AdviceData = {
  version: 1,
  instructions: [],
}
