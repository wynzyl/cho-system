/**
 * Shared Zod enum definitions for patient-related validators
 * Extracted from lib/validators/patient.ts and lib/validators/patient-form.ts
 * to eliminate duplicate enum definitions
 */

// Sex enum values (does not include UNKNOWN - that's database-only for legacy data)
export const SEX_VALUES = ["MALE", "FEMALE", "OTHER"] as const
export type Sex = (typeof SEX_VALUES)[number]

// Civil status enum values (form validation - excludes UNKNOWN)
export const CIVIL_STATUS_VALUES = ["SINGLE", "MARRIED", "WIDOWED", "SEPARATED", "ANNULLED"] as const
export type CivilStatus = (typeof CIVIL_STATUS_VALUES)[number]

// Religion enum values
export const RELIGION_VALUES = [
  "ROMAN_CATHOLIC",
  "PROTESTANT",
  "IGLESIA_NI_CRISTO",
  "ISLAM",
  "BUDDHIST",
  "OTHER",
  "NONE",
  "UNKNOWN",
] as const
export type Religion = (typeof RELIGION_VALUES)[number]

// Education enum values
export const EDUCATION_VALUES = [
  "NO_FORMAL",
  "ELEMENTARY",
  "JUNIOR_HIGH",
  "SENIOR_HIGH",
  "VOCATIONAL",
  "COLLEGE",
  "POSTGRADUATE",
  "UNKNOWN",
] as const
export type Education = (typeof EDUCATION_VALUES)[number]

// Blood type enum values
export const BLOOD_TYPE_VALUES = [
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
  "UNKNOWN",
] as const
export type BloodType = (typeof BLOOD_TYPE_VALUES)[number]

// PhilHealth membership type enum values
export const PHILHEALTH_MEMBERSHIP_TYPE_VALUES = [
  "EMPLOYED",
  "SELF_EMPLOYED",
  "INDIGENT",
  "OFW",
  "LIFETIME",
  "DEPENDENT",
  "OTHER",
] as const
export type PhilhealthMembershipType = (typeof PHILHEALTH_MEMBERSHIP_TYPE_VALUES)[number]

// Allergy category enum values
export const ALLERGY_CATEGORY_VALUES = ["Drug", "Food", "Environmental", "Other"] as const
export type AllergyCategory = (typeof ALLERGY_CATEGORY_VALUES)[number]

// Allergy severity enum values
export const ALLERGY_SEVERITY_VALUES = ["MILD", "MODERATE", "SEVERE"] as const
export type AllergySeverity = (typeof ALLERGY_SEVERITY_VALUES)[number]

// Allergy status enum values
export const ALLERGY_STATUS_VALUES = ["ACTIVE", "INACTIVE", "RESOLVED"] as const
export type AllergyStatus = (typeof ALLERGY_STATUS_VALUES)[number]
