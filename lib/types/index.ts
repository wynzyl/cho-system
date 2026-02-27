// Consultation types
export type {
  MedicalHistoryData,
  ChronicConditionEntry,
  SurgeryEntry,
  MedicationEntry,
  ImmunizationEntry,
  FamilyHistoryData,
  FamilyHistoryEntry,
  SocialHistoryData,
  ExposureHistoryEntry,
  HpiDoctorNotes,
  PhysicalExamData,
  PhysicalExamSection,
  ProceduresData,
  ProcedureEntry,
  AdviceData,
  ReferralInfo,
} from "./consultation"

export {
  createDefaultMedicalHistoryData,
  createDefaultFamilyHistoryData,
  createDefaultSocialHistoryData,
  createDefaultHpiDoctorNotes,
  createDefaultPhysicalExamData,
  createDefaultProceduresData,
  createDefaultAdviceData,
} from "./consultation"
