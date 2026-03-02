// Doctor domain actions
export * from "./diagnosis"
export * from "./prescriptions"
export * from "./lab-orders"

// Queue and encounter actions
export {
  getDoctorQueueAction,
  type DoctorQueueItem,
  type DoctorQueueResponse,
} from "./get-doctor-queue"
export { claimForConsultAction } from "./claim-for-consult"
export { releaseFromConsultAction } from "./release-from-consult"
export {
  getEncounterForConsultAction,
  type EncounterForConsult,
  type PatientForConsult,
  type PatientAllergyForConsult,
  type TriageRecordForConsult,
  type DiagnosisForConsult,
  type PrescriptionForConsult,
  type LabOrderForConsult,
} from "./get-encounter-for-consult"

// Consultation workflow actions
export { startConsultationAction } from "./start-consultation"
export { saveConsultationAction } from "./save-consultation"
export { completeConsultationAction } from "./complete-consultation"

// Diagnosis actions
export { addDiagnosisAction, type AddDiagnosisResult } from "./add-diagnosis"
export { removeDiagnosisAction } from "./remove-diagnosis"
