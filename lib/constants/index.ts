// Barangay constants
export { BARANGAY_DATA } from "./barangay"
export type { BarangayCode, BarangayName } from "./barangay"

// Patient demographic constants
export {
  CIVIL_STATUS_OPTIONS,
  RELIGION_OPTIONS,
  EDUCATION_OPTIONS,
  BLOOD_TYPE_OPTIONS,
} from "./patient"
export type {
  CivilStatusValue,
  ReligionValue,
  EducationValue,
  BloodTypeValue,
} from "./patient"

// PhilHealth constants
export { PHILHEALTH_MEMBERSHIP_TYPE_OPTIONS } from "./philhealth"
export type { PhilHealthMembershipTypeValue } from "./philhealth"

// Allergy constants
export {
  ALLERGY_SEVERITY_OPTIONS,
  ALLERGY_STATUS_OPTIONS,
  PATIENT_ALLERGY_STATUS_OPTIONS,
  COMMON_ALLERGENS,
  ALLERGEN_CATEGORIES,
  getAllergensByCategory,
  getSeverityColor,
} from "./allergy"
export type {
  AllergySeverityValue,
  AllergyStatusValue,
  PatientAllergyStatusValue,
  AllergenCategory,
} from "./allergy"

// Diagnosis taxonomy constants
export {
  DIAGNOSIS_CATEGORY_CODES,
  DIAGNOSIS_CATEGORIES,
  DIAGNOSIS_SUBCATEGORIES,
} from "./diagnosis-taxonomy"
export type {
  DiagnosisCategoryCode,
  DiagnosisCategorySeed,
  DiagnosisSubcategorySeed,
  IcdMappingSeed,
} from "./diagnosis-taxonomy"

// Error constants
export { ERROR_CODES, ERROR_MESSAGES } from "./errors"
export type { ErrorCode } from "./errors"

// Consultation constants
export {
  ASSOCIATED_SYMPTOMS,
  SYMPTOM_ONSET_OPTIONS,
  SYMPTOM_DURATION_OPTIONS,
  EXPOSURE_FLAGS,
  getExposureAlert,
  getExposureColor,
  PREGNANCY_STATUS_OPTIONS,
  BODY_SYSTEMS,
  PE_FINDINGS,
  COMMON_PROCEDURES,
  COMMON_ADVICE,
  COMMON_LAB_TESTS,
  PAIN_CHARACTER_OPTIONS,
} from "./consultation"
export type {
  AssociatedSymptomValue,
  ExposureFlagValue,
  PregnancyStatusValue,
  BodySystemValue,
  ProcedureValue,
} from "./consultation"
