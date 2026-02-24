export const CIVIL_STATUS_OPTIONS = [
  { value: "SINGLE", label: "Single" },
  { value: "MARRIED", label: "Married" },
  { value: "WIDOWED", label: "Widowed" },
  { value: "SEPARATED", label: "Separated" },
  { value: "ANNULLED", label: "Annulled" },
  { value: "UNKNOWN", label: "Unknown" },
] as const

export const RELIGION_OPTIONS = [
  { value: "ROMAN_CATHOLIC", label: "Roman Catholic" },
  { value: "PROTESTANT", label: "Protestant" },
  { value: "IGLESIA_NI_CRISTO", label: "Iglesia ni Cristo" },
  { value: "ISLAM", label: "Islam" },
  { value: "BUDDHIST", label: "Buddhist" },
  { value: "OTHER", label: "Other" },
  { value: "NONE", label: "None" },
  { value: "UNKNOWN", label: "Unknown" },
] as const

export const EDUCATION_OPTIONS = [
  { value: "NO_FORMAL", label: "No Formal Education" },
  { value: "ELEMENTARY", label: "Elementary" },
  { value: "JUNIOR_HIGH", label: "Junior High School" },
  { value: "SENIOR_HIGH", label: "Senior High School" },
  { value: "VOCATIONAL", label: "Vocational/Technical" },
  { value: "COLLEGE", label: "College" },
  { value: "POSTGRADUATE", label: "Post-Graduate" },
  { value: "UNKNOWN", label: "Unknown" },
] as const

export const BLOOD_TYPE_OPTIONS = [
  { value: "A_POSITIVE", label: "A+" },
  { value: "A_NEGATIVE", label: "A-" },
  { value: "B_POSITIVE", label: "B+" },
  { value: "B_NEGATIVE", label: "B-" },
  { value: "AB_POSITIVE", label: "AB+" },
  { value: "AB_NEGATIVE", label: "AB-" },
  { value: "O_POSITIVE", label: "O+" },
  { value: "O_NEGATIVE", label: "O-" },
  { value: "UNKNOWN", label: "Unknown" },
] as const

export type CivilStatusValue = (typeof CIVIL_STATUS_OPTIONS)[number]["value"]
export type ReligionValue = (typeof RELIGION_OPTIONS)[number]["value"]
export type EducationValue = (typeof EDUCATION_OPTIONS)[number]["value"]
export type BloodTypeValue = (typeof BLOOD_TYPE_OPTIONS)[number]["value"]
