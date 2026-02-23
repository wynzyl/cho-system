/**
 * Diagnosis Taxonomy Seed Data
 *
 * 3-Layer Structure:
 * 1. DiagnosisCategory - Practical grouping (e.g., "Tropical Diseases")
 * 2. DiagnosisSubcategory - Clinical name used by doctors (e.g., "Dengue Fever")
 * 3. DiagnosisIcdMap - ICD-10 code mappings (e.g., A90 → Dengue Fever)
 *
 * Flags:
 * - isNotifiable: DOH reporting required
 * - isAnimalBite: ABTC tracking required
 */

// ============================================================================
// CATEGORY CODES (for type safety)
// ============================================================================

export const DIAGNOSIS_CATEGORY_CODES = {
  ACUTE: "ACUTE",
  TROPICAL: "TROPICAL",
  ANIMAL_ENV: "ANIMAL_ENV",
  CHRONIC: "CHRONIC",
  MCH: "MCH",
  REPRO: "REPRO",
  TRAUMA: "TRAUMA",
  PUBLIC_HEALTH: "PUBLIC_HEALTH",
  MENTAL: "MENTAL",
  OTHER: "OTHER",
} as const

export type DiagnosisCategoryCode =
  (typeof DIAGNOSIS_CATEGORY_CODES)[keyof typeof DIAGNOSIS_CATEGORY_CODES]

// ============================================================================
// CATEGORIES (10 total)
// ============================================================================

export interface DiagnosisCategorySeed {
  code: DiagnosisCategoryCode
  name: string
  description: string
  sortOrder: number
}

export const DIAGNOSIS_CATEGORIES: DiagnosisCategorySeed[] = [
  {
    code: "ACUTE",
    name: "Common Acute Conditions",
    description:
      "Acute infections and common illnesses seen in primary care settings",
    sortOrder: 1,
  },
  {
    code: "TROPICAL",
    name: "Vector-Borne & Tropical Diseases",
    description:
      "Mosquito-borne and other tropical diseases endemic to the Philippines",
    sortOrder: 2,
  },
  {
    code: "ANIMAL_ENV",
    name: "Animal & Environmental Exposure",
    description:
      "Animal bites, rabies exposure, and environmental health conditions",
    sortOrder: 3,
  },
  {
    code: "CHRONIC",
    name: "Chronic Disease Management",
    description:
      "Non-communicable diseases requiring long-term management and follow-up",
    sortOrder: 4,
  },
  {
    code: "MCH",
    name: "Maternal & Child Health",
    description:
      "Pregnancy care, prenatal conditions, and pediatric health concerns",
    sortOrder: 5,
  },
  {
    code: "REPRO",
    name: "Reproductive Health",
    description: "Family planning, STIs, and reproductive health services",
    sortOrder: 6,
  },
  {
    code: "TRAUMA",
    name: "Minor Injuries / Primary Care Trauma",
    description: "Wounds, burns, sprains, and minor trauma manageable at CHO level",
    sortOrder: 7,
  },
  {
    code: "PUBLIC_HEALTH",
    name: "Public Health & Preventive Cases",
    description:
      "Tuberculosis, immunization-related, and other public health program cases",
    sortOrder: 8,
  },
  {
    code: "MENTAL",
    name: "Mental Health",
    description:
      "Common mental health conditions seen in primary care settings",
    sortOrder: 9,
  },
  {
    code: "OTHER",
    name: "Other Common CHO Encounters",
    description:
      "General symptoms, medical certificates, and other primary care encounters",
    sortOrder: 10,
  },
]

// ============================================================================
// SUBCATEGORIES WITH ICD-10 MAPPINGS
// ============================================================================

export interface IcdMappingSeed {
  icd10Code: string
  icdTitle: string
  isDefault: boolean
}

export interface DiagnosisSubcategorySeed {
  categoryCode: DiagnosisCategoryCode
  code: string
  name: string
  description?: string
  isNotifiable: boolean
  isAnimalBite: boolean
  sortOrder: number
  icdMappings: IcdMappingSeed[]
}

export const DIAGNOSIS_SUBCATEGORIES: DiagnosisSubcategorySeed[] = [
  // ============================================================================
  // ACUTE - Common Acute Conditions
  // ============================================================================
  {
    categoryCode: "ACUTE",
    code: "URTI",
    name: "Upper Respiratory Tract Infection",
    description: "Common cold, pharyngitis, rhinitis",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 1,
    icdMappings: [
      { icd10Code: "J06.9", icdTitle: "Acute Upper Respiratory Infection, unspecified", isDefault: true },
      { icd10Code: "J00", icdTitle: "Acute Nasopharyngitis (Common Cold)", isDefault: false },
      { icd10Code: "J02.9", icdTitle: "Acute Pharyngitis, unspecified", isDefault: false },
    ],
  },
  {
    categoryCode: "ACUTE",
    code: "LRTI",
    name: "Lower Respiratory Tract Infection",
    description: "Bronchitis, pneumonia",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 2,
    icdMappings: [
      { icd10Code: "J22", icdTitle: "Unspecified Acute Lower Respiratory Infection", isDefault: true },
      { icd10Code: "J20.9", icdTitle: "Acute Bronchitis, unspecified", isDefault: false },
      { icd10Code: "J18.9", icdTitle: "Pneumonia, unspecified organism", isDefault: false },
    ],
  },
  {
    categoryCode: "ACUTE",
    code: "AGE",
    name: "Acute Gastroenteritis",
    description: "Diarrhea, vomiting, gastroenteritis",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 3,
    icdMappings: [
      { icd10Code: "A09", icdTitle: "Infectious Gastroenteritis and Colitis, unspecified", isDefault: true },
      { icd10Code: "K52.9", icdTitle: "Non-infective Gastroenteritis and Colitis, unspecified", isDefault: false },
    ],
  },
  {
    categoryCode: "ACUTE",
    code: "UTI",
    name: "Urinary Tract Infection",
    description: "Cystitis, urethritis",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 4,
    icdMappings: [
      { icd10Code: "N39.0", icdTitle: "Urinary Tract Infection, site not specified", isDefault: true },
      { icd10Code: "N30.9", icdTitle: "Cystitis, unspecified", isDefault: false },
    ],
  },
  {
    categoryCode: "ACUTE",
    code: "SKIN_INFECTION",
    name: "Skin Infection",
    description: "Cellulitis, abscess, impetigo",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 5,
    icdMappings: [
      { icd10Code: "L08.9", icdTitle: "Local Infection of Skin, unspecified", isDefault: true },
      { icd10Code: "L03.9", icdTitle: "Cellulitis, unspecified", isDefault: false },
      { icd10Code: "L02.9", icdTitle: "Cutaneous Abscess, unspecified", isDefault: false },
      { icd10Code: "L01.0", icdTitle: "Impetigo", isDefault: false },
    ],
  },
  {
    categoryCode: "ACUTE",
    code: "OTITIS_MEDIA",
    name: "Acute Otitis Media",
    description: "Middle ear infection",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 6,
    icdMappings: [
      { icd10Code: "H66.9", icdTitle: "Otitis Media, unspecified", isDefault: true },
      { icd10Code: "H65.9", icdTitle: "Nonsuppurative Otitis Media, unspecified", isDefault: false },
    ],
  },
  {
    categoryCode: "ACUTE",
    code: "CONJUNCTIVITIS",
    name: "Conjunctivitis",
    description: "Pink eye, eye infection",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 7,
    icdMappings: [
      { icd10Code: "H10.9", icdTitle: "Conjunctivitis, unspecified", isDefault: true },
      { icd10Code: "B30.9", icdTitle: "Viral Conjunctivitis, unspecified", isDefault: false },
    ],
  },
  {
    categoryCode: "ACUTE",
    code: "HEADACHE",
    name: "Headache / Migraine",
    description: "Tension headache, migraine",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 8,
    icdMappings: [
      { icd10Code: "R51", icdTitle: "Headache", isDefault: true },
      { icd10Code: "G43.9", icdTitle: "Migraine, unspecified", isDefault: false },
    ],
  },
  {
    categoryCode: "ACUTE",
    code: "ALLERGIC_RHINITIS",
    name: "Allergic Rhinitis",
    description: "Hay fever, allergic rhinitis",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 9,
    icdMappings: [
      { icd10Code: "J30.4", icdTitle: "Allergic Rhinitis, unspecified", isDefault: true },
      { icd10Code: "J30.1", icdTitle: "Allergic Rhinitis due to Pollen", isDefault: false },
    ],
  },

  // ============================================================================
  // TROPICAL - Vector-Borne & Tropical Diseases
  // ============================================================================
  {
    categoryCode: "TROPICAL",
    code: "DENGUE",
    name: "Dengue Fever",
    description: "Classic dengue fever without hemorrhage",
    isNotifiable: true,
    isAnimalBite: false,
    sortOrder: 1,
    icdMappings: [
      { icd10Code: "A90", icdTitle: "Dengue Fever (Classical Dengue)", isDefault: true },
    ],
  },
  {
    categoryCode: "TROPICAL",
    code: "DHF",
    name: "Dengue Hemorrhagic Fever",
    description: "Severe dengue with hemorrhagic manifestations",
    isNotifiable: true,
    isAnimalBite: false,
    sortOrder: 2,
    icdMappings: [
      { icd10Code: "A91", icdTitle: "Dengue Hemorrhagic Fever", isDefault: true },
    ],
  },
  {
    categoryCode: "TROPICAL",
    code: "CHIKUNGUNYA",
    name: "Chikungunya",
    description: "Chikungunya virus disease",
    isNotifiable: true,
    isAnimalBite: false,
    sortOrder: 3,
    icdMappings: [
      { icd10Code: "A92.0", icdTitle: "Chikungunya Virus Disease", isDefault: true },
    ],
  },
  {
    categoryCode: "TROPICAL",
    code: "LEPTOSPIROSIS",
    name: "Leptospirosis",
    description: "Leptospira infection",
    isNotifiable: true,
    isAnimalBite: false,
    sortOrder: 4,
    icdMappings: [
      { icd10Code: "A27.9", icdTitle: "Leptospirosis, unspecified", isDefault: true },
      { icd10Code: "A27.0", icdTitle: "Leptospirosis Icterohemorrhagica", isDefault: false },
    ],
  },
  {
    categoryCode: "TROPICAL",
    code: "MALARIA",
    name: "Malaria",
    description: "Plasmodium infection",
    isNotifiable: true,
    isAnimalBite: false,
    sortOrder: 5,
    icdMappings: [
      { icd10Code: "B54", icdTitle: "Unspecified Malaria", isDefault: true },
      { icd10Code: "B50.9", icdTitle: "Plasmodium Falciparum Malaria, unspecified", isDefault: false },
      { icd10Code: "B51.9", icdTitle: "Plasmodium Vivax Malaria, unspecified", isDefault: false },
    ],
  },
  {
    categoryCode: "TROPICAL",
    code: "TYPHOID",
    name: "Typhoid Fever",
    description: "Salmonella typhi infection",
    isNotifiable: true,
    isAnimalBite: false,
    sortOrder: 6,
    icdMappings: [
      { icd10Code: "A01.0", icdTitle: "Typhoid Fever", isDefault: true },
    ],
  },
  {
    categoryCode: "TROPICAL",
    code: "CHOLERA",
    name: "Cholera",
    description: "Vibrio cholerae infection",
    isNotifiable: true,
    isAnimalBite: false,
    sortOrder: 7,
    icdMappings: [
      { icd10Code: "A00.9", icdTitle: "Cholera, unspecified", isDefault: true },
    ],
  },
  {
    categoryCode: "TROPICAL",
    code: "FILARIASIS",
    name: "Filariasis",
    description: "Lymphatic filariasis",
    isNotifiable: true,
    isAnimalBite: false,
    sortOrder: 8,
    icdMappings: [
      { icd10Code: "B74.9", icdTitle: "Filariasis, unspecified", isDefault: true },
    ],
  },
  {
    categoryCode: "TROPICAL",
    code: "SCHISTOSOMIASIS",
    name: "Schistosomiasis",
    description: "Bilharzia",
    isNotifiable: true,
    isAnimalBite: false,
    sortOrder: 9,
    icdMappings: [
      { icd10Code: "B65.9", icdTitle: "Schistosomiasis, unspecified", isDefault: true },
    ],
  },

  // ============================================================================
  // ANIMAL_ENV - Animal & Environmental Exposure
  // ============================================================================
  {
    categoryCode: "ANIMAL_ENV",
    code: "DOG_BITE",
    name: "Dog Bite",
    description: "Dog bite requiring ABTC protocol",
    isNotifiable: true,
    isAnimalBite: true,
    sortOrder: 1,
    icdMappings: [
      { icd10Code: "W54", icdTitle: "Bitten or Struck by Dog", isDefault: true },
    ],
  },
  {
    categoryCode: "ANIMAL_ENV",
    code: "CAT_BITE",
    name: "Cat Bite / Scratch",
    description: "Cat bite or scratch requiring ABTC protocol",
    isNotifiable: true,
    isAnimalBite: true,
    sortOrder: 2,
    icdMappings: [
      { icd10Code: "W55.0", icdTitle: "Bitten by Cat", isDefault: true },
      { icd10Code: "W55.1", icdTitle: "Struck by Cat", isDefault: false },
    ],
  },
  {
    categoryCode: "ANIMAL_ENV",
    code: "OTHER_ANIMAL_BITE",
    name: "Other Animal Bite",
    description: "Bite by other mammals (rat, bat, etc.)",
    isNotifiable: true,
    isAnimalBite: true,
    sortOrder: 3,
    icdMappings: [
      { icd10Code: "W55.8", icdTitle: "Bitten or Struck by Other Mammals", isDefault: true },
      { icd10Code: "W53", icdTitle: "Bitten by Rat", isDefault: false },
    ],
  },
  {
    categoryCode: "ANIMAL_ENV",
    code: "RABIES_EXPOSURE",
    name: "Rabies Exposure",
    description: "Contact with potentially rabid animal",
    isNotifiable: true,
    isAnimalBite: true,
    sortOrder: 4,
    icdMappings: [
      { icd10Code: "Z20.3", icdTitle: "Contact with and Exposure to Rabies", isDefault: true },
    ],
  },
  {
    categoryCode: "ANIMAL_ENV",
    code: "RABIES",
    name: "Rabies",
    description: "Confirmed rabies infection",
    isNotifiable: true,
    isAnimalBite: true,
    sortOrder: 5,
    icdMappings: [
      { icd10Code: "A82.9", icdTitle: "Rabies, unspecified", isDefault: true },
    ],
  },
  {
    categoryCode: "ANIMAL_ENV",
    code: "INSECT_BITE",
    name: "Insect Bite / Sting",
    description: "Bee sting, wasp sting, insect bite",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 6,
    icdMappings: [
      { icd10Code: "W57", icdTitle: "Bitten or Stung by Nonvenomous Insect", isDefault: true },
      { icd10Code: "X23", icdTitle: "Contact with Hornets, Wasps, and Bees", isDefault: false },
    ],
  },
  {
    categoryCode: "ANIMAL_ENV",
    code: "SNAKE_BITE",
    name: "Snake Bite",
    description: "Venomous or non-venomous snake bite",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 7,
    icdMappings: [
      { icd10Code: "T63.0", icdTitle: "Toxic Effect of Snake Venom", isDefault: true },
      { icd10Code: "W59", icdTitle: "Bitten by Nonvenomous Reptile", isDefault: false },
    ],
  },

  // ============================================================================
  // CHRONIC - Chronic Disease Management
  // ============================================================================
  {
    categoryCode: "CHRONIC",
    code: "HYPERTENSION",
    name: "Hypertension",
    description: "Essential hypertension",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 1,
    icdMappings: [
      { icd10Code: "I10", icdTitle: "Essential (Primary) Hypertension", isDefault: true },
    ],
  },
  {
    categoryCode: "CHRONIC",
    code: "DM_TYPE2",
    name: "Type 2 Diabetes Mellitus",
    description: "Non-insulin dependent diabetes",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 2,
    icdMappings: [
      { icd10Code: "E11.9", icdTitle: "Type 2 Diabetes Mellitus without Complications", isDefault: true },
      { icd10Code: "E11.65", icdTitle: "Type 2 DM with Hyperglycemia", isDefault: false },
    ],
  },
  {
    categoryCode: "CHRONIC",
    code: "DM_TYPE1",
    name: "Type 1 Diabetes Mellitus",
    description: "Insulin dependent diabetes",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 3,
    icdMappings: [
      { icd10Code: "E10.9", icdTitle: "Type 1 Diabetes Mellitus without Complications", isDefault: true },
    ],
  },
  {
    categoryCode: "CHRONIC",
    code: "ASTHMA",
    name: "Bronchial Asthma",
    description: "Chronic asthma",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 4,
    icdMappings: [
      { icd10Code: "J45.9", icdTitle: "Asthma, unspecified", isDefault: true },
      { icd10Code: "J45.2", icdTitle: "Mild Intermittent Asthma", isDefault: false },
      { icd10Code: "J45.3", icdTitle: "Mild Persistent Asthma", isDefault: false },
      { icd10Code: "J45.4", icdTitle: "Moderate Persistent Asthma", isDefault: false },
      { icd10Code: "J45.5", icdTitle: "Severe Persistent Asthma", isDefault: false },
    ],
  },
  {
    categoryCode: "CHRONIC",
    code: "COPD",
    name: "COPD",
    description: "Chronic obstructive pulmonary disease",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 5,
    icdMappings: [
      { icd10Code: "J44.9", icdTitle: "Chronic Obstructive Pulmonary Disease, unspecified", isDefault: true },
      { icd10Code: "J44.1", icdTitle: "COPD with Acute Exacerbation", isDefault: false },
    ],
  },
  {
    categoryCode: "CHRONIC",
    code: "DYSLIPIDEMIA",
    name: "Dyslipidemia",
    description: "Hypercholesterolemia, hyperlipidemia",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 6,
    icdMappings: [
      { icd10Code: "E78.5", icdTitle: "Hyperlipidemia, unspecified", isDefault: true },
      { icd10Code: "E78.0", icdTitle: "Pure Hypercholesterolemia", isDefault: false },
    ],
  },
  {
    categoryCode: "CHRONIC",
    code: "GOUT",
    name: "Gout",
    description: "Gouty arthritis",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 7,
    icdMappings: [
      { icd10Code: "M10.9", icdTitle: "Gout, unspecified", isDefault: true },
    ],
  },
  {
    categoryCode: "CHRONIC",
    code: "ARTHRITIS",
    name: "Arthritis",
    description: "Osteoarthritis, rheumatoid arthritis",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 8,
    icdMappings: [
      { icd10Code: "M19.9", icdTitle: "Osteoarthritis, unspecified site", isDefault: true },
      { icd10Code: "M06.9", icdTitle: "Rheumatoid Arthritis, unspecified", isDefault: false },
    ],
  },
  {
    categoryCode: "CHRONIC",
    code: "THYROID_DISORDER",
    name: "Thyroid Disorder",
    description: "Hypothyroidism, hyperthyroidism",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 9,
    icdMappings: [
      { icd10Code: "E03.9", icdTitle: "Hypothyroidism, unspecified", isDefault: true },
      { icd10Code: "E05.9", icdTitle: "Thyrotoxicosis, unspecified", isDefault: false },
    ],
  },
  {
    categoryCode: "CHRONIC",
    code: "CKD",
    name: "Chronic Kidney Disease",
    description: "Chronic renal disease",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 10,
    icdMappings: [
      { icd10Code: "N18.9", icdTitle: "Chronic Kidney Disease, unspecified", isDefault: true },
      { icd10Code: "N18.3", icdTitle: "CKD Stage 3", isDefault: false },
      { icd10Code: "N18.4", icdTitle: "CKD Stage 4", isDefault: false },
    ],
  },

  // ============================================================================
  // MCH - Maternal & Child Health
  // ============================================================================
  {
    categoryCode: "MCH",
    code: "NORMAL_PREGNANCY",
    name: "Normal Pregnancy",
    description: "Routine prenatal care",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 1,
    icdMappings: [
      { icd10Code: "Z34.9", icdTitle: "Supervision of Normal Pregnancy, unspecified", isDefault: true },
      { icd10Code: "Z34.0", icdTitle: "Supervision of Normal First Pregnancy", isDefault: false },
    ],
  },
  {
    categoryCode: "MCH",
    code: "HIGH_RISK_PREGNANCY",
    name: "High-Risk Pregnancy",
    description: "Pregnancy requiring additional monitoring",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 2,
    icdMappings: [
      { icd10Code: "O09.9", icdTitle: "Supervision of High-Risk Pregnancy, unspecified", isDefault: true },
    ],
  },
  {
    categoryCode: "MCH",
    code: "HYPEREMESIS",
    name: "Hyperemesis Gravidarum",
    description: "Severe nausea and vomiting in pregnancy",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 3,
    icdMappings: [
      { icd10Code: "O21.0", icdTitle: "Mild Hyperemesis Gravidarum", isDefault: true },
      { icd10Code: "O21.1", icdTitle: "Hyperemesis Gravidarum with Metabolic Disturbance", isDefault: false },
    ],
  },
  {
    categoryCode: "MCH",
    code: "PREECLAMPSIA",
    name: "Preeclampsia",
    description: "Pregnancy-induced hypertension with proteinuria",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 4,
    icdMappings: [
      { icd10Code: "O14.9", icdTitle: "Preeclampsia, unspecified", isDefault: true },
      { icd10Code: "O14.0", icdTitle: "Mild to Moderate Preeclampsia", isDefault: false },
    ],
  },
  {
    categoryCode: "MCH",
    code: "GESTATIONAL_DM",
    name: "Gestational Diabetes",
    description: "Diabetes in pregnancy",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 5,
    icdMappings: [
      { icd10Code: "O24.4", icdTitle: "Gestational Diabetes Mellitus", isDefault: true },
    ],
  },
  {
    categoryCode: "MCH",
    code: "ANEMIA_PREGNANCY",
    name: "Anemia in Pregnancy",
    description: "Iron deficiency anemia complicating pregnancy",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 6,
    icdMappings: [
      { icd10Code: "O99.0", icdTitle: "Anemia Complicating Pregnancy", isDefault: true },
      { icd10Code: "D50.9", icdTitle: "Iron Deficiency Anemia, unspecified", isDefault: false },
    ],
  },
  {
    categoryCode: "MCH",
    code: "POSTPARTUM_CARE",
    name: "Postpartum Care",
    description: "Routine postpartum follow-up",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 7,
    icdMappings: [
      { icd10Code: "Z39.0", icdTitle: "Postpartum Care and Examination", isDefault: true },
    ],
  },
  {
    categoryCode: "MCH",
    code: "WELL_BABY",
    name: "Well Baby Check",
    description: "Routine infant health supervision",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 8,
    icdMappings: [
      { icd10Code: "Z00.1", icdTitle: "Routine Child Health Examination", isDefault: true },
    ],
  },
  {
    categoryCode: "MCH",
    code: "MALNUTRITION",
    name: "Malnutrition",
    description: "Underweight, wasting, stunting in children",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 9,
    icdMappings: [
      { icd10Code: "E46", icdTitle: "Unspecified Protein-Calorie Malnutrition", isDefault: true },
      { icd10Code: "E44.0", icdTitle: "Moderate Protein-Calorie Malnutrition", isDefault: false },
      { icd10Code: "E43", icdTitle: "Severe Protein-Calorie Malnutrition", isDefault: false },
    ],
  },

  // ============================================================================
  // REPRO - Reproductive Health
  // ============================================================================
  {
    categoryCode: "REPRO",
    code: "FAMILY_PLANNING",
    name: "Family Planning Counseling",
    description: "Contraceptive counseling and management",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 1,
    icdMappings: [
      { icd10Code: "Z30.0", icdTitle: "General Counseling on Contraception", isDefault: true },
    ],
  },
  {
    categoryCode: "REPRO",
    code: "IUD_INSERTION",
    name: "IUD Insertion/Removal",
    description: "Intrauterine device services",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 2,
    icdMappings: [
      { icd10Code: "Z30.1", icdTitle: "Insertion of Intrauterine Contraceptive Device", isDefault: true },
      { icd10Code: "Z30.5", icdTitle: "Surveillance of Contraceptive Device", isDefault: false },
    ],
  },
  {
    categoryCode: "REPRO",
    code: "IMPLANT",
    name: "Contraceptive Implant",
    description: "Subdermal implant insertion/removal",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 3,
    icdMappings: [
      { icd10Code: "Z30.01", icdTitle: "Encounter for Initial Prescription of Contraceptive - Subdermal", isDefault: true },
    ],
  },
  {
    categoryCode: "REPRO",
    code: "DMPA",
    name: "Injectable Contraceptive",
    description: "DMPA injection",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 4,
    icdMappings: [
      { icd10Code: "Z30.4", icdTitle: "Surveillance of Contraceptive Drugs", isDefault: true },
    ],
  },
  {
    categoryCode: "REPRO",
    code: "STI_SCREENING",
    name: "STI Screening",
    description: "Sexually transmitted infection screening",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 5,
    icdMappings: [
      { icd10Code: "Z11.3", icdTitle: "Screening for STIs", isDefault: true },
    ],
  },
  {
    categoryCode: "REPRO",
    code: "VAGINITIS",
    name: "Vaginitis",
    description: "Vaginal discharge, candidiasis, bacterial vaginosis",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 6,
    icdMappings: [
      { icd10Code: "N76.0", icdTitle: "Acute Vaginitis", isDefault: true },
      { icd10Code: "B37.3", icdTitle: "Candidiasis of Vulva and Vagina", isDefault: false },
      { icd10Code: "N76.1", icdTitle: "Subacute and Chronic Vaginitis", isDefault: false },
    ],
  },
  {
    categoryCode: "REPRO",
    code: "DYSMENORRHEA",
    name: "Dysmenorrhea",
    description: "Painful menstruation",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 7,
    icdMappings: [
      { icd10Code: "N94.6", icdTitle: "Dysmenorrhea, unspecified", isDefault: true },
    ],
  },
  {
    categoryCode: "REPRO",
    code: "MENSTRUAL_DISORDER",
    name: "Menstrual Disorder",
    description: "Irregular, heavy, or absent menstruation",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 8,
    icdMappings: [
      { icd10Code: "N92.6", icdTitle: "Irregular Menstruation, unspecified", isDefault: true },
      { icd10Code: "N91.2", icdTitle: "Amenorrhea, unspecified", isDefault: false },
      { icd10Code: "N92.0", icdTitle: "Excessive and Frequent Menstruation", isDefault: false },
    ],
  },

  // ============================================================================
  // TRAUMA - Minor Injuries / Primary Care Trauma
  // ============================================================================
  {
    categoryCode: "TRAUMA",
    code: "LACERATION",
    name: "Laceration / Open Wound",
    description: "Cuts requiring suturing or wound care",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 1,
    icdMappings: [
      { icd10Code: "T14.1", icdTitle: "Open Wound of Unspecified Body Region", isDefault: true },
      { icd10Code: "S01.9", icdTitle: "Open Wound of Head, part unspecified", isDefault: false },
      { icd10Code: "S61.9", icdTitle: "Open Wound of Wrist and Hand", isDefault: false },
    ],
  },
  {
    categoryCode: "TRAUMA",
    code: "ABRASION",
    name: "Abrasion / Superficial Injury",
    description: "Scrapes, superficial wounds",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 2,
    icdMappings: [
      { icd10Code: "T14.0", icdTitle: "Superficial Injury of Unspecified Body Region", isDefault: true },
    ],
  },
  {
    categoryCode: "TRAUMA",
    code: "CONTUSION",
    name: "Contusion / Bruise",
    description: "Bruising without fracture",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 3,
    icdMappings: [
      { icd10Code: "T14.8", icdTitle: "Other Injury of Unspecified Body Region", isDefault: true },
      { icd10Code: "S00.9", icdTitle: "Superficial Injury of Head, part unspecified", isDefault: false },
    ],
  },
  {
    categoryCode: "TRAUMA",
    code: "SPRAIN",
    name: "Sprain / Strain",
    description: "Ligament or muscle strain",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 4,
    icdMappings: [
      { icd10Code: "T14.3", icdTitle: "Sprain of Unspecified Body Region", isDefault: true },
      { icd10Code: "S93.4", icdTitle: "Sprain of Ankle", isDefault: false },
      { icd10Code: "S83.4", icdTitle: "Sprain of Knee", isDefault: false },
    ],
  },
  {
    categoryCode: "TRAUMA",
    code: "BURN_MINOR",
    name: "Minor Burn",
    description: "First or second degree burns, small area",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 5,
    icdMappings: [
      { icd10Code: "T30.0", icdTitle: "Burn of Unspecified Body Region, unspecified degree", isDefault: true },
      { icd10Code: "T30.1", icdTitle: "Burn of First Degree, unspecified site", isDefault: false },
      { icd10Code: "T30.2", icdTitle: "Burn of Second Degree, unspecified site", isDefault: false },
    ],
  },
  {
    categoryCode: "TRAUMA",
    code: "FRACTURE_SUSPECTED",
    name: "Suspected Fracture",
    description: "Suspected fracture requiring referral for X-ray",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 6,
    icdMappings: [
      { icd10Code: "T14.2", icdTitle: "Fracture of Unspecified Body Region", isDefault: true },
    ],
  },
  {
    categoryCode: "TRAUMA",
    code: "FB_EYE",
    name: "Foreign Body in Eye",
    description: "Foreign body in conjunctival sac or cornea",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 7,
    icdMappings: [
      { icd10Code: "T15.9", icdTitle: "Foreign Body on External Eye, part unspecified", isDefault: true },
    ],
  },
  {
    categoryCode: "TRAUMA",
    code: "FB_EAR",
    name: "Foreign Body in Ear",
    description: "Foreign body in external auditory canal",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 8,
    icdMappings: [
      { icd10Code: "T16", icdTitle: "Foreign Body in Ear", isDefault: true },
    ],
  },

  // ============================================================================
  // PUBLIC_HEALTH - Public Health & Preventive Cases
  // ============================================================================
  {
    categoryCode: "PUBLIC_HEALTH",
    code: "PTB",
    name: "Pulmonary Tuberculosis",
    description: "Respiratory tuberculosis",
    isNotifiable: true,
    isAnimalBite: false,
    sortOrder: 1,
    icdMappings: [
      { icd10Code: "A15.9", icdTitle: "Respiratory Tuberculosis, unspecified", isDefault: true },
      { icd10Code: "A15.0", icdTitle: "Tuberculosis of Lung", isDefault: false },
    ],
  },
  {
    categoryCode: "PUBLIC_HEALTH",
    code: "EPTB",
    name: "Extra-pulmonary TB",
    description: "Tuberculosis of other organs",
    isNotifiable: true,
    isAnimalBite: false,
    sortOrder: 2,
    icdMappings: [
      { icd10Code: "A18.9", icdTitle: "Tuberculosis of Other Organs, unspecified", isDefault: true },
    ],
  },
  {
    categoryCode: "PUBLIC_HEALTH",
    code: "TB_SCREENING",
    name: "TB Screening",
    description: "Screening for tuberculosis",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 3,
    icdMappings: [
      { icd10Code: "Z11.1", icdTitle: "Special Screening for Respiratory TB", isDefault: true },
    ],
  },
  {
    categoryCode: "PUBLIC_HEALTH",
    code: "HIV_SCREENING",
    name: "HIV Screening",
    description: "Screening for HIV infection",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 4,
    icdMappings: [
      { icd10Code: "Z11.4", icdTitle: "Special Screening for HIV", isDefault: true },
    ],
  },
  {
    categoryCode: "PUBLIC_HEALTH",
    code: "HIV_POSITIVE",
    name: "HIV Infection",
    description: "HIV positive, disease stage varies",
    isNotifiable: true,
    isAnimalBite: false,
    sortOrder: 5,
    icdMappings: [
      { icd10Code: "B24", icdTitle: "Unspecified HIV Disease", isDefault: true },
      { icd10Code: "B20", icdTitle: "HIV Disease Resulting in Infectious Disease", isDefault: false },
    ],
  },
  {
    categoryCode: "PUBLIC_HEALTH",
    code: "IMMUNIZATION",
    name: "Immunization",
    description: "Routine vaccination",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 6,
    icdMappings: [
      { icd10Code: "Z23", icdTitle: "Encounter for Immunization", isDefault: true },
    ],
  },
  {
    categoryCode: "PUBLIC_HEALTH",
    code: "MEASLES",
    name: "Measles",
    description: "Rubeola",
    isNotifiable: true,
    isAnimalBite: false,
    sortOrder: 7,
    icdMappings: [
      { icd10Code: "B05.9", icdTitle: "Measles without Complication", isDefault: true },
    ],
  },
  {
    categoryCode: "PUBLIC_HEALTH",
    code: "VARICELLA",
    name: "Chickenpox",
    description: "Varicella",
    isNotifiable: true,
    isAnimalBite: false,
    sortOrder: 8,
    icdMappings: [
      { icd10Code: "B01.9", icdTitle: "Varicella without Complication", isDefault: true },
    ],
  },
  {
    categoryCode: "PUBLIC_HEALTH",
    code: "HAND_FOOT_MOUTH",
    name: "Hand, Foot and Mouth Disease",
    description: "HFMD",
    isNotifiable: true,
    isAnimalBite: false,
    sortOrder: 9,
    icdMappings: [
      { icd10Code: "B08.4", icdTitle: "Enteroviral Vesicular Stomatitis with Exanthem", isDefault: true },
    ],
  },
  {
    categoryCode: "PUBLIC_HEALTH",
    code: "HEPATITIS_A",
    name: "Hepatitis A",
    description: "Acute viral hepatitis A",
    isNotifiable: true,
    isAnimalBite: false,
    sortOrder: 10,
    icdMappings: [
      { icd10Code: "B15.9", icdTitle: "Hepatitis A without Hepatic Coma", isDefault: true },
    ],
  },
  {
    categoryCode: "PUBLIC_HEALTH",
    code: "HEPATITIS_B",
    name: "Hepatitis B",
    description: "Viral hepatitis B",
    isNotifiable: true,
    isAnimalBite: false,
    sortOrder: 11,
    icdMappings: [
      { icd10Code: "B16.9", icdTitle: "Acute Hepatitis B without Delta-Agent", isDefault: true },
      { icd10Code: "B18.1", icdTitle: "Chronic Viral Hepatitis B", isDefault: false },
    ],
  },

  // ============================================================================
  // MENTAL - Mental Health
  // ============================================================================
  {
    categoryCode: "MENTAL",
    code: "ANXIETY",
    name: "Anxiety Disorder",
    description: "Generalized anxiety, panic disorder",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 1,
    icdMappings: [
      { icd10Code: "F41.9", icdTitle: "Anxiety Disorder, unspecified", isDefault: true },
      { icd10Code: "F41.1", icdTitle: "Generalized Anxiety Disorder", isDefault: false },
      { icd10Code: "F41.0", icdTitle: "Panic Disorder", isDefault: false },
    ],
  },
  {
    categoryCode: "MENTAL",
    code: "DEPRESSION",
    name: "Depression",
    description: "Major depressive disorder, depressive episode",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 2,
    icdMappings: [
      { icd10Code: "F32.9", icdTitle: "Depressive Episode, unspecified", isDefault: true },
      { icd10Code: "F32.0", icdTitle: "Mild Depressive Episode", isDefault: false },
      { icd10Code: "F32.1", icdTitle: "Moderate Depressive Episode", isDefault: false },
    ],
  },
  {
    categoryCode: "MENTAL",
    code: "INSOMNIA",
    name: "Insomnia",
    description: "Sleep disturbance",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 3,
    icdMappings: [
      { icd10Code: "G47.0", icdTitle: "Insomnia", isDefault: true },
      { icd10Code: "F51.0", icdTitle: "Nonorganic Insomnia", isDefault: false },
    ],
  },
  {
    categoryCode: "MENTAL",
    code: "STRESS_REACTION",
    name: "Acute Stress Reaction",
    description: "Adjustment disorder, acute stress",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 4,
    icdMappings: [
      { icd10Code: "F43.0", icdTitle: "Acute Stress Reaction", isDefault: true },
      { icd10Code: "F43.2", icdTitle: "Adjustment Disorders", isDefault: false },
    ],
  },
  {
    categoryCode: "MENTAL",
    code: "SUBSTANCE_USE",
    name: "Substance Use Disorder",
    description: "Alcohol or drug use disorder",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 5,
    icdMappings: [
      { icd10Code: "F10.9", icdTitle: "Alcohol Use, unspecified", isDefault: true },
      { icd10Code: "F19.9", icdTitle: "Drug Use, unspecified", isDefault: false },
    ],
  },

  // ============================================================================
  // OTHER - Other Common CHO Encounters
  // ============================================================================
  {
    categoryCode: "OTHER",
    code: "GENERAL_CHECKUP",
    name: "General Medical Checkup",
    description: "Routine health examination",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 1,
    icdMappings: [
      { icd10Code: "Z00.0", icdTitle: "General Adult Medical Examination", isDefault: true },
    ],
  },
  {
    categoryCode: "OTHER",
    code: "MED_CERT",
    name: "Medical Certificate",
    description: "For employment, school, or other purposes",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 2,
    icdMappings: [
      { icd10Code: "Z02.7", icdTitle: "Issue of Medical Certificate", isDefault: true },
    ],
  },
  {
    categoryCode: "OTHER",
    code: "FOLLOW_UP",
    name: "Follow-up Visit",
    description: "Follow-up examination after treatment",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 3,
    icdMappings: [
      { icd10Code: "Z09", icdTitle: "Encounter for Follow-up Examination", isDefault: true },
    ],
  },
  {
    categoryCode: "OTHER",
    code: "DIZZINESS",
    name: "Dizziness / Vertigo",
    description: "Non-specific dizziness",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 4,
    icdMappings: [
      { icd10Code: "R42", icdTitle: "Dizziness and Giddiness", isDefault: true },
      { icd10Code: "H81.1", icdTitle: "Benign Paroxysmal Vertigo", isDefault: false },
    ],
  },
  {
    categoryCode: "OTHER",
    code: "FEVER_UNSPECIFIED",
    name: "Fever, Unspecified",
    description: "Fever of unknown origin",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 5,
    icdMappings: [
      { icd10Code: "R50.9", icdTitle: "Fever, unspecified", isDefault: true },
    ],
  },
  {
    categoryCode: "OTHER",
    code: "ABDOMINAL_PAIN",
    name: "Abdominal Pain",
    description: "Non-specific abdominal pain",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 6,
    icdMappings: [
      { icd10Code: "R10.4", icdTitle: "Other and Unspecified Abdominal Pain", isDefault: true },
      { icd10Code: "R10.1", icdTitle: "Pain Localized to Upper Abdomen", isDefault: false },
    ],
  },
  {
    categoryCode: "OTHER",
    code: "BACK_PAIN",
    name: "Back Pain",
    description: "Low back pain, back strain",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 7,
    icdMappings: [
      { icd10Code: "M54.5", icdTitle: "Low Back Pain", isDefault: true },
      { icd10Code: "M54.9", icdTitle: "Dorsalgia, unspecified", isDefault: false },
    ],
  },
  {
    categoryCode: "OTHER",
    code: "CHEST_PAIN",
    name: "Chest Pain",
    description: "Non-cardiac chest pain",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 8,
    icdMappings: [
      { icd10Code: "R07.9", icdTitle: "Chest Pain, unspecified", isDefault: true },
    ],
  },
  {
    categoryCode: "OTHER",
    code: "FATIGUE",
    name: "Fatigue / Malaise",
    description: "General weakness, tiredness",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 9,
    icdMappings: [
      { icd10Code: "R53", icdTitle: "Malaise and Fatigue", isDefault: true },
    ],
  },
  {
    categoryCode: "OTHER",
    code: "REFERRAL",
    name: "Referral to Higher Facility",
    description: "Patient referred for specialist care",
    isNotifiable: false,
    isAnimalBite: false,
    sortOrder: 10,
    icdMappings: [
      { icd10Code: "Z75.3", icdTitle: "Unavailability of Health-Care Facilities", isDefault: true },
    ],
  },
]
