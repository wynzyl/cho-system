/**
 * Constants for consultation workflow
 * Used by both triage (HPI screening) and doctor (full consultation)
 */

// =============================================================================
// HPI SCREENING (Triage captures)
// =============================================================================

export const ASSOCIATED_SYMPTOMS = [
  { value: "fever", label: "Fever" },
  { value: "chills", label: "Chills" },
  { value: "headache", label: "Headache" },
  { value: "dizziness", label: "Dizziness" },
  { value: "fatigue", label: "Fatigue/Weakness" },
  { value: "nausea", label: "Nausea" },
  { value: "vomiting", label: "Vomiting" },
  { value: "diarrhea", label: "Diarrhea" },
  { value: "constipation", label: "Constipation" },
  { value: "abdominal_pain", label: "Abdominal Pain" },
  { value: "cough", label: "Cough" },
  { value: "shortness_of_breath", label: "Shortness of Breath" },
  { value: "chest_pain", label: "Chest Pain" },
  { value: "rash", label: "Skin Rash" },
  { value: "joint_pain", label: "Joint Pain" },
  { value: "muscle_pain", label: "Muscle Pain" },
  { value: "loss_of_appetite", label: "Loss of Appetite" },
  { value: "weight_loss", label: "Weight Loss" },
  { value: "sore_throat", label: "Sore Throat" },
  { value: "runny_nose", label: "Runny Nose" },
] as const

export type AssociatedSymptomValue = (typeof ASSOCIATED_SYMPTOMS)[number]["value"]

export const SYMPTOM_ONSET_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "2_3_days", label: "2-3 days ago" },
  { value: "this_week", label: "This week" },
  { value: "1_2_weeks", label: "1-2 weeks ago" },
  { value: "more_than_2_weeks", label: "More than 2 weeks ago" },
] as const

export const SYMPTOM_DURATION_OPTIONS = [
  { value: "hours", label: "Less than a day" },
  { value: "1_2_days", label: "1-2 days" },
  { value: "3_5_days", label: "3-5 days" },
  { value: "1_week", label: "About 1 week" },
  { value: "2_weeks", label: "About 2 weeks" },
  { value: "more_than_2_weeks", label: "More than 2 weeks" },
  { value: "chronic", label: "Chronic/Recurring" },
] as const

// =============================================================================
// EXPOSURE SCREENING (CHO-specific)
// =============================================================================

export const EXPOSURE_FLAGS = [
  { value: "animal_bite", label: "Animal Bite", alert: "ABTC", color: "red" },
  { value: "flood_exposure", label: "Flood/Water Exposure", alert: "Leptospirosis Risk", color: "orange" },
  { value: "tb_contact", label: "TB Contact", alert: "DOTS Screening", color: "yellow" },
  { value: "dengue_area", label: "Dengue Endemic Area", alert: "Dengue Risk", color: "orange" },
  { value: "rabies_exposure", label: "Rabies Exposure", alert: "ABTC", color: "red" },
  { value: "recent_travel", label: "Recent Travel", alert: null, color: "blue" },
  { value: "covid_contact", label: "COVID-19 Contact", alert: "COVID Protocol", color: "purple" },
] as const

export type ExposureFlagValue = (typeof EXPOSURE_FLAGS)[number]["value"]

export function getExposureAlert(value: string): string | null {
  const flag = EXPOSURE_FLAGS.find((f) => f.value === value)
  return flag?.alert ?? null
}

export function getExposureColor(value: string): string {
  const flag = EXPOSURE_FLAGS.find((f) => f.value === value)
  return flag?.color ?? "gray"
}

// =============================================================================
// PREGNANCY STATUS
// =============================================================================

export const PREGNANCY_STATUS_OPTIONS = [
  { value: "not_applicable", label: "N/A (Male)" },
  { value: "not_pregnant", label: "Not Pregnant" },
  { value: "pregnant", label: "Pregnant" },
  { value: "postpartum", label: "Postpartum" },
] as const

export type PregnancyStatusValue = (typeof PREGNANCY_STATUS_OPTIONS)[number]["value"]

// =============================================================================
// PHYSICAL EXAMINATION
// =============================================================================

export const BODY_SYSTEMS = [
  { value: "general", label: "General Appearance" },
  { value: "heent", label: "HEENT" },
  { value: "chest", label: "Chest/Lungs" },
  { value: "cardiovascular", label: "Cardiovascular" },
  { value: "abdomen", label: "Abdomen" },
  { value: "skin", label: "Skin" },
  { value: "extremities", label: "Extremities" },
  { value: "neurologic", label: "Neurologic" },
] as const

export type BodySystemValue = (typeof BODY_SYSTEMS)[number]["value"]

// PE findings organized by body system
export const PE_FINDINGS: Record<BodySystemValue, { value: string; label: string; isNormal?: boolean }[]> = {
  general: [
    { value: "awake_alert", label: "Awake & Alert", isNormal: true },
    { value: "oriented", label: "Oriented x3", isNormal: true },
    { value: "not_in_distress", label: "Not in Distress", isNormal: true },
    { value: "well_nourished", label: "Well Nourished", isNormal: true },
    { value: "weak", label: "Weak/Lethargic" },
    { value: "pale", label: "Pale" },
    { value: "dehydrated", label: "Dehydrated" },
    { value: "in_distress", label: "In Distress" },
    { value: "febrile", label: "Febrile" },
    { value: "diaphoretic", label: "Diaphoretic" },
  ],
  heent: [
    { value: "head_normocephalic", label: "Head Normocephalic", isNormal: true },
    { value: "pupils_equal", label: "Pupils Equal & Reactive", isNormal: true },
    { value: "conjunctiva_pink", label: "Conjunctiva Pink", isNormal: true },
    { value: "ears_clear", label: "Ears Clear", isNormal: true },
    { value: "throat_clear", label: "Throat Clear", isNormal: true },
    { value: "no_lymphadenopathy", label: "No Lymphadenopathy", isNormal: true },
    { value: "pale_conjunctiva", label: "Pale Conjunctiva" },
    { value: "icteric_sclera", label: "Icteric Sclera" },
    { value: "pharyngeal_erythema", label: "Pharyngeal Erythema" },
    { value: "tonsillar_enlargement", label: "Tonsillar Enlargement" },
    { value: "cervical_lymphadenopathy", label: "Cervical Lymphadenopathy" },
    { value: "ear_discharge", label: "Ear Discharge" },
  ],
  chest: [
    { value: "clear_breath_sounds", label: "Clear Breath Sounds", isNormal: true },
    { value: "no_retractions", label: "No Retractions", isNormal: true },
    { value: "symmetric_expansion", label: "Symmetric Chest Expansion", isNormal: true },
    { value: "wheezes", label: "Wheezes" },
    { value: "crackles", label: "Crackles/Rales" },
    { value: "rhonchi", label: "Rhonchi" },
    { value: "decreased_breath_sounds", label: "Decreased Breath Sounds" },
    { value: "intercostal_retractions", label: "Intercostal Retractions" },
    { value: "nasal_flaring", label: "Nasal Flaring" },
  ],
  cardiovascular: [
    { value: "regular_rhythm", label: "Regular Rhythm", isNormal: true },
    { value: "no_murmur", label: "No Murmur", isNormal: true },
    { value: "normal_s1_s2", label: "Normal S1/S2", isNormal: true },
    { value: "good_peripheral_pulses", label: "Good Peripheral Pulses", isNormal: true },
    { value: "irregular_rhythm", label: "Irregular Rhythm" },
    { value: "murmur", label: "Murmur Present" },
    { value: "tachycardia", label: "Tachycardia" },
    { value: "bradycardia", label: "Bradycardia" },
    { value: "gallop", label: "Gallop" },
    { value: "weak_pulses", label: "Weak Peripheral Pulses" },
  ],
  abdomen: [
    { value: "soft_nontender", label: "Soft & Non-tender", isNormal: true },
    { value: "normal_bowel_sounds", label: "Normal Bowel Sounds", isNormal: true },
    { value: "no_hepatomegaly", label: "No Hepatomegaly", isNormal: true },
    { value: "no_splenomegaly", label: "No Splenomegaly", isNormal: true },
    { value: "tenderness", label: "Tenderness" },
    { value: "guarding", label: "Guarding" },
    { value: "rigidity", label: "Rigidity" },
    { value: "distended", label: "Distended" },
    { value: "hepatomegaly", label: "Hepatomegaly" },
    { value: "splenomegaly", label: "Splenomegaly" },
    { value: "hyperactive_bs", label: "Hyperactive Bowel Sounds" },
    { value: "hypoactive_bs", label: "Hypoactive Bowel Sounds" },
  ],
  skin: [
    { value: "warm_dry", label: "Warm & Dry", isNormal: true },
    { value: "good_turgor", label: "Good Skin Turgor", isNormal: true },
    { value: "no_rash", label: "No Rash", isNormal: true },
    { value: "no_lesions", label: "No Lesions", isNormal: true },
    { value: "rash", label: "Rash Present" },
    { value: "petechiae", label: "Petechiae" },
    { value: "ecchymosis", label: "Ecchymosis" },
    { value: "poor_turgor", label: "Poor Skin Turgor" },
    { value: "jaundice", label: "Jaundice" },
    { value: "cyanosis", label: "Cyanosis" },
    { value: "wound", label: "Wound Present" },
  ],
  extremities: [
    { value: "no_edema", label: "No Edema", isNormal: true },
    { value: "full_rom", label: "Full ROM", isNormal: true },
    { value: "no_deformity", label: "No Deformity", isNormal: true },
    { value: "good_cap_refill", label: "Good Capillary Refill", isNormal: true },
    { value: "edema", label: "Edema Present" },
    { value: "joint_swelling", label: "Joint Swelling" },
    { value: "limited_rom", label: "Limited ROM" },
    { value: "clubbing", label: "Clubbing" },
    { value: "delayed_cap_refill", label: "Delayed Capillary Refill" },
  ],
  neurologic: [
    { value: "oriented", label: "Oriented", isNormal: true },
    { value: "normal_gait", label: "Normal Gait", isNormal: true },
    { value: "intact_sensation", label: "Intact Sensation", isNormal: true },
    { value: "normal_reflexes", label: "Normal Reflexes", isNormal: true },
    { value: "no_focal_deficits", label: "No Focal Deficits", isNormal: true },
    { value: "altered_consciousness", label: "Altered Consciousness" },
    { value: "focal_deficit", label: "Focal Deficit" },
    { value: "abnormal_gait", label: "Abnormal Gait" },
    { value: "tremor", label: "Tremor" },
    { value: "meningeal_signs", label: "Meningeal Signs" },
  ],
}

// =============================================================================
// PROCEDURES (CHO-level)
// =============================================================================

export const COMMON_PROCEDURES = [
  { value: "wound_cleaning", label: "Wound Cleaning" },
  { value: "wound_dressing", label: "Wound Dressing" },
  { value: "suturing", label: "Suturing" },
  { value: "suture_removal", label: "Suture Removal" },
  { value: "nebulization", label: "Nebulization" },
  { value: "injection_im", label: "IM Injection" },
  { value: "injection_iv", label: "IV Injection" },
  { value: "ear_irrigation", label: "Ear Irrigation" },
  { value: "foreign_body_removal", label: "Foreign Body Removal" },
  { value: "incision_drainage", label: "Incision & Drainage" },
  { value: "splinting", label: "Splinting" },
  { value: "ecg", label: "ECG" },
  { value: "blood_extraction", label: "Blood Extraction" },
] as const

export type ProcedureValue = (typeof COMMON_PROCEDURES)[number]["value"]

// =============================================================================
// ADVICE TEMPLATES
// =============================================================================

export const COMMON_ADVICE = [
  "Increase oral fluid intake",
  "Adequate bed rest",
  "Return if symptoms worsen",
  "Complete prescribed medications",
  "Avoid strenuous activity",
  "Monitor temperature regularly",
  "Soft diet as tolerated",
  "Apply cold compress as needed",
  "Apply warm compress as needed",
  "Keep wound clean and dry",
  "Follow up as scheduled",
  "Seek immediate care if with difficulty breathing",
  "Seek immediate care if with persistent vomiting",
  "Watch out for warning signs",
] as const

// =============================================================================
// COMMON LAB TESTS (for quick selection)
// =============================================================================

export const COMMON_LAB_TESTS = [
  { code: "CBC", name: "Complete Blood Count" },
  { code: "UA", name: "Urinalysis" },
  { code: "FBS", name: "Fasting Blood Sugar" },
  { code: "RBS", name: "Random Blood Sugar" },
  { code: "LIPID", name: "Lipid Profile" },
  { code: "CREAT", name: "Creatinine" },
  { code: "BUN", name: "Blood Urea Nitrogen" },
  { code: "SGPT", name: "SGPT/ALT" },
  { code: "SGOT", name: "SGOT/AST" },
  { code: "CHEST_XRAY", name: "Chest X-Ray" },
  { code: "ECG", name: "ECG/EKG" },
  { code: "STOOL", name: "Stool Examination" },
  { code: "DENGUE_NS1", name: "Dengue NS1 Antigen" },
  { code: "DENGUE_IGG_IGM", name: "Dengue IgG/IgM" },
  { code: "PREGNANCY", name: "Pregnancy Test" },
] as const

// =============================================================================
// HPI CHARACTER OPTIONS (Doctor refinement)
// =============================================================================

export const PAIN_CHARACTER_OPTIONS = [
  { value: "sharp", label: "Sharp" },
  { value: "dull", label: "Dull" },
  { value: "throbbing", label: "Throbbing" },
  { value: "burning", label: "Burning" },
  { value: "stabbing", label: "Stabbing" },
  { value: "cramping", label: "Cramping" },
  { value: "aching", label: "Aching" },
  { value: "pressure", label: "Pressure" },
] as const
