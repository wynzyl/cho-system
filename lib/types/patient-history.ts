/**
 * TypeScript interfaces for patient history viewing in doctor consultation
 * Used by PatientHistorySheet and related components
 */

import type { EncounterStatus, LabOrderStatus } from "@prisma/client"

// =============================================================================
// HISTORICAL ENCOUNTER SUMMARY (for timeline view)
// =============================================================================

export interface HistoricalEncounterSummary {
  id: string
  occurredAt: Date
  status: EncounterStatus
  chiefComplaint: string | null
  facilityName: string
  doctorName: string | null
  triageByName: string | null
  diagnoses: {
    id: string
    text: string
    icdCode: string | null
  }[]
  prescriptionCount: number
  labOrderCount: number
}

// =============================================================================
// HISTORICAL ENCOUNTER DETAILS (lazy-loaded when expanded)
// =============================================================================

export interface HistoricalTriageRecord {
  bpSystolic: number | null
  bpDiastolic: number | null
  heartRate: number | null
  respiratoryRate: number | null
  temperatureC: number | null
  spo2: number | null
  weightKg: number | null
  heightCm: number | null
  notes: string | null
  symptomOnset: string | null
  symptomDuration: string | null
  painSeverity: number | null
  associatedSymptoms: string[]
  exposureFlags: string[]
  exposureNotes: string | null
  recordedAt: Date
}

export interface HistoricalDiagnosis {
  id: string
  text: string
  subcategory: {
    code: string
    name: string
  } | null
  icdCode: string | null
  createdAt: Date
}

export interface HistoricalPrescriptionItem {
  medicineName: string
  dosage: string | null
  frequency: string | null
  duration: string | null
  quantity: number | null
  instructions: string | null
}

export interface HistoricalPrescription {
  id: string
  items: HistoricalPrescriptionItem[]
  notes: string | null
  createdAt: Date
}

export interface HistoricalLabOrderItem {
  testCode: string | null
  testName: string
  notes: string | null
}

export interface HistoricalLabResult {
  id: string
  fileUrl: string | null
  fileName: string | null
  releasedAt: Date | null
  uploadedAt: Date
}

export interface HistoricalLabOrder {
  id: string
  status: LabOrderStatus
  items: HistoricalLabOrderItem[]
  results: HistoricalLabResult[]
  requestedAt: Date
}

export interface HistoricalEncounterDetails {
  id: string
  occurredAt: Date
  status: EncounterStatus
  chiefComplaint: string | null
  triageNotes: string | null
  clinicalImpression: string | null
  consultStartedAt: Date | null
  consultEndedAt: Date | null
  facility: { name: string }
  doctor: { name: string } | null
  triageBy: { name: string } | null
  triageRecord: HistoricalTriageRecord | null
  diagnoses: HistoricalDiagnosis[]
  prescriptions: HistoricalPrescription[]
  labOrders: HistoricalLabOrder[]
  // JSON fields (parsed)
  hpiDoctorNotes: unknown | null
  physicalExamData: unknown | null
  proceduresData: unknown | null
  adviceData: unknown | null
}

// =============================================================================
// AGGREGATED DIAGNOSIS (across all encounters)
// =============================================================================

export interface AggregatedDiagnosis {
  text: string
  icdCode: string | null
  subcategoryCode: string | null
  subcategoryName: string | null
  count: number
  firstOccurrence: Date
  lastOccurrence: Date
  encounterIds: string[]
}

// =============================================================================
// AGGREGATED MEDICATION (across all encounters)
// =============================================================================

export interface AggregatedMedication {
  medicineName: string
  prescriptionCount: number
  lastPrescribed: Date
  dosages: string[] // unique dosages used
  encounterIds: string[]
}

// =============================================================================
// VITALS RECORD (for trend chart)
// =============================================================================

export interface VitalsRecord {
  encounterId: string
  occurredAt: Date
  bpSystolic: number | null
  bpDiastolic: number | null
  heartRate: number | null
  respiratoryRate: number | null
  temperatureC: number | null
  spo2: number | null
  weightKg: number | null
  heightCm: number | null
}

// =============================================================================
// PATIENT HISTORY RESULT (main response type)
// =============================================================================

export interface PatientHistoryResult {
  patient: {
    id: string
    fullName: string
    patientCode: string
  }
  encounters: HistoricalEncounterSummary[]
  aggregatedDiagnoses: AggregatedDiagnosis[]
  aggregatedMedications: AggregatedMedication[]
  vitalsHistory: VitalsRecord[]
  totalEncounters: number
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

export function isHistoricalTriageRecord(
  data: unknown
): data is HistoricalTriageRecord {
  if (!data || typeof data !== "object") return false
  const d = data as HistoricalTriageRecord
  return "recordedAt" in d && Array.isArray(d.associatedSymptoms)
}
