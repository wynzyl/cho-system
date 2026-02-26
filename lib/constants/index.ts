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
