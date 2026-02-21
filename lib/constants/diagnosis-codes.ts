import { DiagnosisCategory } from "@prisma/client"

/** One diagnosis code entry for CHO reporting (ICD-10 + category flags). */
export type DiagnosisCodeEntry = {
  icd10Code: string
  title: string
  category: DiagnosisCategory
  isNotifiable: boolean
  requiresLab: boolean
  requiresReferral: boolean
  isAnimalBiteCase: boolean
}

/**
 * ICD-10 Diagnosis codes for CHO reporting
 * Covers: Infectious diseases, Notifiable diseases, Animal bites,
 * Chronic conditions, Maternal health, Maternal-child health, and Trauma
 */
export const DIAGNOSIS_CODE_DATA = [
  // INFECTIOUS (4)
  { icd10Code: "J06.9", title: "Acute Upper Respiratory Infection, unspecified", category: "INFECTIOUS", isNotifiable: false, requiresLab: false, requiresReferral: false, isAnimalBiteCase: false },
  { icd10Code: "J02.9", title: "Acute Pharyngitis, unspecified", category: "INFECTIOUS", isNotifiable: false, requiresLab: false, requiresReferral: false, isAnimalBiteCase: false },
  { icd10Code: "J18.9", title: "Pneumonia, unspecified organism", category: "INFECTIOUS", isNotifiable: false, requiresLab: true, requiresReferral: true, isAnimalBiteCase: false },
  { icd10Code: "A09", title: "Infectious Gastroenteritis and Colitis", category: "INFECTIOUS", isNotifiable: false, requiresLab: false, requiresReferral: false, isAnimalBiteCase: false },

  // NOTIFIABLE_DISEASE (5)
  { icd10Code: "A90", title: "Dengue Fever (Classical Dengue)", category: "NOTIFIABLE_DISEASE", isNotifiable: true, requiresLab: true, requiresReferral: false, isAnimalBiteCase: false },
  { icd10Code: "A91", title: "Dengue Hemorrhagic Fever", category: "NOTIFIABLE_DISEASE", isNotifiable: true, requiresLab: true, requiresReferral: true, isAnimalBiteCase: false },
  { icd10Code: "A92.0", title: "Chikungunya Virus Disease", category: "NOTIFIABLE_DISEASE", isNotifiable: true, requiresLab: true, requiresReferral: false, isAnimalBiteCase: false },
  { icd10Code: "A27.9", title: "Leptospirosis, unspecified", category: "NOTIFIABLE_DISEASE", isNotifiable: true, requiresLab: true, requiresReferral: true, isAnimalBiteCase: false },
  { icd10Code: "A15.9", title: "Respiratory Tuberculosis, unspecified", category: "NOTIFIABLE_DISEASE", isNotifiable: true, requiresLab: true, requiresReferral: true, isAnimalBiteCase: false },

  // ANIMAL_BITE (3)
  { icd10Code: "W54", title: "Bitten by Dog", category: "ANIMAL_BITE", isNotifiable: true, requiresLab: false, requiresReferral: false, isAnimalBiteCase: true },
  { icd10Code: "W55", title: "Bitten by Other Mammals", category: "ANIMAL_BITE", isNotifiable: true, requiresLab: false, requiresReferral: false, isAnimalBiteCase: true },
  { icd10Code: "Z20.3", title: "Contact with and Exposure to Rabies", category: "ANIMAL_BITE", isNotifiable: true, requiresLab: false, requiresReferral: false, isAnimalBiteCase: true },

  // CHRONIC (3)
  { icd10Code: "I10", title: "Essential (Primary) Hypertension", category: "CHRONIC", isNotifiable: false, requiresLab: true, requiresReferral: false, isAnimalBiteCase: false },
  { icd10Code: "E11.9", title: "Type 2 Diabetes Mellitus without Complications", category: "CHRONIC", isNotifiable: false, requiresLab: true, requiresReferral: false, isAnimalBiteCase: false },
  { icd10Code: "J45.9", title: "Asthma, unspecified", category: "CHRONIC", isNotifiable: false, requiresLab: false, requiresReferral: false, isAnimalBiteCase: false },

  // MATERNAL (1)
  { icd10Code: "Z34.9", title: "Supervision of Normal Pregnancy", category: "MATERNAL", isNotifiable: false, requiresLab: true, requiresReferral: false, isAnimalBiteCase: false },

  // MATERNAL_CHILD (2)
  { icd10Code: "D50.9", title: "Iron Deficiency Anemia, unspecified", category: "MATERNAL_CHILD", isNotifiable: false, requiresLab: true, requiresReferral: false, isAnimalBiteCase: false },
  { icd10Code: "E44.1", title: "Moderate Protein-Calorie Malnutrition", category: "MATERNAL_CHILD", isNotifiable: true, requiresLab: false, requiresReferral: true, isAnimalBiteCase: false },

  // TRAUMA (2)
  { icd10Code: "S01.0", title: "Open Wound of Scalp", category: "TRAUMA", isNotifiable: false, requiresLab: false, requiresReferral: false, isAnimalBiteCase: false },
  { icd10Code: "T30.0", title: "Burn of Unspecified Body Region, unspecified degree", category: "TRAUMA", isNotifiable: false, requiresLab: false, requiresReferral: true, isAnimalBiteCase: false },
] as const satisfies readonly DiagnosisCodeEntry[]
