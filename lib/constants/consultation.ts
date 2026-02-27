/**
 * Constants for Doctor Consultation and Triage HPI Screening
 * CHO-specific options for Philippine City Health Office workflows
 */

import { DIAGNOSIS_SUBCATEGORIES } from "./diagnosis-taxonomy"

// ============================================================================
// HPI SCREENING (Triage captures)
// ============================================================================

export const ASSOCIATED_SYMPTOMS = [
  { value: "fever", label: "Fever" },
  { value: "chills", label: "Chills" },
  { value: "headache", label: "Headache" },
  { value: "dizziness", label: "Dizziness" },
  { value: "nausea", label: "Nausea" },
  { value: "vomiting", label: "Vomiting" },
  { value: "diarrhea", label: "Diarrhea" },
  { value: "cough", label: "Cough" },
  { value: "colds", label: "Colds/Runny Nose" },
  { value: "sore_throat", label: "Sore Throat" },
  { value: "shortness_of_breath", label: "Shortness of Breath" },
  { value: "chest_pain", label: "Chest Pain" },
  { value: "abdominal_pain", label: "Abdominal Pain" },
  { value: "body_malaise", label: "Body Malaise" },
  { value: "joint_pain", label: "Joint Pain" },
  { value: "muscle_pain", label: "Muscle Pain" },
  { value: "rash", label: "Rash" },
  { value: "fatigue", label: "Fatigue/Weakness" },
  { value: "loss_of_appetite", label: "Loss of Appetite" },
  { value: "weight_loss", label: "Weight Loss" },
  { value: "night_sweats", label: "Night Sweats" },
  { value: "difficulty_urinating", label: "Difficulty Urinating" },
  { value: "painful_urination", label: "Painful Urination" },
] as const

export type AssociatedSymptomValue = (typeof ASSOCIATED_SYMPTOMS)[number]["value"]

export const SYMPTOM_ONSET_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "2_3_days", label: "2-3 days ago" },
  { value: "this_week", label: "This week" },
  { value: "1_2_weeks", label: "1-2 weeks ago" },
  { value: "more_than_2_weeks", label: "More than 2 weeks ago" },
  { value: "gradual", label: "Gradual onset" },
] as const

export type SymptomOnsetValue = (typeof SYMPTOM_ONSET_OPTIONS)[number]["value"]

export const SYMPTOM_DURATION_OPTIONS = [
  { value: "hours", label: "Less than a day" },
  { value: "1_2_days", label: "1-2 days" },
  { value: "3_5_days", label: "3-5 days" },
  { value: "1_week", label: "About 1 week" },
  { value: "2_weeks", label: "About 2 weeks" },
  { value: "more_than_2_weeks", label: "More than 2 weeks" },
  { value: "intermittent", label: "Intermittent/On and off" },
] as const

export type SymptomDurationValue = (typeof SYMPTOM_DURATION_OPTIONS)[number]["value"]

// ============================================================================
// EXPOSURE SCREENING (CHO-specific)
// ============================================================================

export const EXPOSURE_FLAGS = [
  { value: "animal_bite", label: "Animal Bite", alert: "ABTC", color: "red" },
  { value: "flood_exposure", label: "Flood/Water Exposure", alert: "Leptospirosis", color: "orange" },
  { value: "tb_contact", label: "TB Contact", alert: "DOTS", color: "yellow" },
  { value: "dengue_area", label: "Dengue Endemic Area", alert: "Dengue", color: "orange" },
  { value: "recent_travel", label: "Recent Travel", alert: null, color: "blue" },
  { value: "rabies_exposure", label: "Rabies Exposure", alert: "ABTC", color: "red" },
  { value: "covid_contact", label: "COVID-19 Contact", alert: "COVID", color: "yellow" },
  { value: "food_poisoning", label: "Suspected Food Poisoning", alert: null, color: "orange" },
] as const

export type ExposureFlagValue = (typeof EXPOSURE_FLAGS)[number]["value"]

export function getExposureAlert(flag: string): string | null {
  const exposure = EXPOSURE_FLAGS.find((e) => e.value === flag)
  return exposure?.alert ?? null
}

export function getExposureColor(flag: string): string {
  const exposure = EXPOSURE_FLAGS.find((e) => e.value === flag)
  return exposure?.color ?? "gray"
}

// ============================================================================
// LIFESTYLE / SOCIAL HISTORY (Triage confirms)
// ============================================================================

export const PREGNANCY_STATUS_OPTIONS = [
  { value: "not_applicable", label: "N/A (Male)" },
  { value: "not_pregnant", label: "Not Pregnant" },
  { value: "pregnant", label: "Pregnant" },
  { value: "postpartum", label: "Postpartum" },
  { value: "unknown", label: "Unknown" },
] as const

export type PregnancyStatusValue = (typeof PREGNANCY_STATUS_OPTIONS)[number]["value"]

export const SMOKING_STATUS_OPTIONS = [
  { value: "never", label: "Never Smoked" },
  { value: "former", label: "Former Smoker" },
  { value: "current", label: "Current Smoker" },
] as const

export const ALCOHOL_STATUS_OPTIONS = [
  { value: "none", label: "Non-drinker" },
  { value: "occasional", label: "Occasional" },
  { value: "regular", label: "Regular" },
] as const

// ============================================================================
// CHRONIC CONDITIONS (From diagnosis taxonomy)
// ============================================================================

export const CHRONIC_CONDITIONS = DIAGNOSIS_SUBCATEGORIES
  .filter((s) => s.categoryCode === "CHRONIC")
  .map((s) => ({ value: s.code, label: s.name }))

// ============================================================================
// PHYSICAL EXAMINATION (Doctor only)
// ============================================================================

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

export const PE_FINDINGS = {
  general: [
    { value: "awake_alert", label: "Awake and Alert" },
    { value: "oriented", label: "Oriented to TPP" },
    { value: "not_in_distress", label: "Not in Distress" },
    { value: "in_distress", label: "In Distress" },
    { value: "weak", label: "Weak-looking" },
    { value: "pale", label: "Pale" },
    { value: "dehydrated", label: "Dehydrated" },
    { value: "febrile", label: "Febrile to Touch" },
    { value: "ambulatory", label: "Ambulatory" },
    { value: "wheelchair", label: "On Wheelchair" },
  ],
  heent: [
    { value: "head_normal", label: "Head: Normocephalic, Atraumatic" },
    { value: "eyes_normal", label: "Eyes: Pink Palpebral Conjunctivae, Anicteric Sclerae" },
    { value: "eyes_pale", label: "Eyes: Pale Conjunctivae" },
    { value: "eyes_icteric", label: "Eyes: Icteric Sclerae" },
    { value: "ears_normal", label: "Ears: No Discharge" },
    { value: "ears_discharge", label: "Ears: With Discharge" },
    { value: "nose_normal", label: "Nose: No Discharge" },
    { value: "nose_congested", label: "Nose: Congested" },
    { value: "throat_normal", label: "Throat: No Erythema" },
    { value: "throat_erythema", label: "Throat: Erythematous" },
    { value: "throat_exudate", label: "Throat: With Exudates" },
    { value: "neck_supple", label: "Neck: Supple, No Lymphadenopathy" },
    { value: "neck_lymph", label: "Neck: With Lymphadenopathy" },
  ],
  chest: [
    { value: "chest_symmetric", label: "Symmetric Chest Expansion" },
    { value: "breath_clear", label: "Clear Breath Sounds" },
    { value: "breath_crackles", label: "Crackles/Rales" },
    { value: "breath_wheezes", label: "Wheezes" },
    { value: "breath_rhonchi", label: "Rhonchi" },
    { value: "breath_diminished", label: "Diminished Breath Sounds" },
    { value: "no_retractions", label: "No Retractions" },
    { value: "retractions", label: "With Retractions" },
  ],
  cardiovascular: [
    { value: "heart_regular", label: "Regular Rate and Rhythm" },
    { value: "heart_irregular", label: "Irregular Rhythm" },
    { value: "heart_tachycardia", label: "Tachycardia" },
    { value: "heart_bradycardia", label: "Bradycardia" },
    { value: "no_murmur", label: "No Murmurs" },
    { value: "murmur", label: "With Murmur" },
    { value: "pulses_equal", label: "Pulses Equal Bilaterally" },
    { value: "no_edema", label: "No Pedal Edema" },
    { value: "edema", label: "With Pedal Edema" },
  ],
  abdomen: [
    { value: "abd_soft", label: "Soft" },
    { value: "abd_flat", label: "Flat" },
    { value: "abd_distended", label: "Distended" },
    { value: "abd_nontender", label: "Non-tender" },
    { value: "abd_tender", label: "Tender" },
    { value: "abd_guarding", label: "With Guarding" },
    { value: "abd_rebound", label: "Rebound Tenderness" },
    { value: "bowel_normal", label: "Normoactive Bowel Sounds" },
    { value: "bowel_hyper", label: "Hyperactive Bowel Sounds" },
    { value: "bowel_hypo", label: "Hypoactive Bowel Sounds" },
    { value: "no_organomegaly", label: "No Organomegaly" },
    { value: "hepatomegaly", label: "Hepatomegaly" },
    { value: "splenomegaly", label: "Splenomegaly" },
  ],
  skin: [
    { value: "skin_normal", label: "Normal Skin Turgor" },
    { value: "skin_dry", label: "Dry Skin" },
    { value: "skin_warm", label: "Warm to Touch" },
    { value: "skin_cool", label: "Cool to Touch" },
    { value: "no_rashes", label: "No Rashes" },
    { value: "rashes", label: "With Rashes" },
    { value: "no_lesions", label: "No Lesions" },
    { value: "lesions", label: "With Lesions" },
    { value: "petechiae", label: "Petechiae Present" },
    { value: "cyanosis", label: "Cyanosis" },
    { value: "jaundice", label: "Jaundice" },
  ],
  extremities: [
    { value: "ext_normal", label: "Full Range of Motion" },
    { value: "ext_symmetric", label: "Symmetric" },
    { value: "no_deformity", label: "No Deformities" },
    { value: "deformity", label: "With Deformity" },
    { value: "no_swelling", label: "No Swelling" },
    { value: "swelling", label: "With Swelling" },
    { value: "no_tenderness", label: "No Tenderness" },
    { value: "tenderness", label: "With Tenderness" },
    { value: "crt_normal", label: "CRT < 2 seconds" },
    { value: "crt_delayed", label: "CRT > 2 seconds" },
  ],
  neurologic: [
    { value: "neuro_intact", label: "Grossly Intact" },
    { value: "gcs_15", label: "GCS 15/15" },
    { value: "motor_intact", label: "Motor Strength Intact" },
    { value: "sensory_intact", label: "Sensory Intact" },
    { value: "cranial_intact", label: "Cranial Nerves Intact" },
    { value: "reflex_normal", label: "Normal Reflexes" },
    { value: "gait_normal", label: "Normal Gait" },
    { value: "gait_abnormal", label: "Abnormal Gait" },
    { value: "oriented", label: "Oriented x3" },
    { value: "confused", label: "Confused" },
  ],
} as const

// ============================================================================
// HPI DOCTOR NOTES (Doctor refines triage screening)
// ============================================================================

export const PAIN_CHARACTER_OPTIONS = [
  { value: "sharp", label: "Sharp" },
  { value: "dull", label: "Dull" },
  { value: "throbbing", label: "Throbbing" },
  { value: "cramping", label: "Cramping" },
  { value: "burning", label: "Burning" },
  { value: "stabbing", label: "Stabbing" },
  { value: "aching", label: "Aching" },
  { value: "pressure", label: "Pressure" },
  { value: "squeezing", label: "Squeezing" },
  { value: "colicky", label: "Colicky" },
] as const

export const BODY_LOCATIONS = [
  { value: "head", label: "Head" },
  { value: "face", label: "Face" },
  { value: "neck", label: "Neck" },
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "abdomen_upper", label: "Upper Abdomen" },
  { value: "abdomen_lower", label: "Lower Abdomen" },
  { value: "abdomen_right", label: "Right Abdomen" },
  { value: "abdomen_left", label: "Left Abdomen" },
  { value: "pelvis", label: "Pelvis" },
  { value: "arm_right", label: "Right Arm" },
  { value: "arm_left", label: "Left Arm" },
  { value: "leg_right", label: "Right Leg" },
  { value: "leg_left", label: "Left Leg" },
  { value: "joint", label: "Joint (Specify)" },
  { value: "generalized", label: "Generalized/Whole Body" },
] as const

export const AGGRAVATING_FACTORS = [
  { value: "movement", label: "Movement" },
  { value: "eating", label: "Eating" },
  { value: "lying_down", label: "Lying Down" },
  { value: "standing", label: "Standing" },
  { value: "walking", label: "Walking" },
  { value: "deep_breath", label: "Deep Breathing" },
  { value: "coughing", label: "Coughing" },
  { value: "stress", label: "Stress" },
  { value: "cold", label: "Cold" },
  { value: "heat", label: "Heat" },
] as const

export const RELIEVING_FACTORS = [
  { value: "rest", label: "Rest" },
  { value: "medication", label: "Medication" },
  { value: "position_change", label: "Position Change" },
  { value: "heat_application", label: "Heat Application" },
  { value: "cold_application", label: "Cold Application" },
  { value: "eating", label: "Eating" },
  { value: "antacid", label: "Antacid" },
  { value: "sleep", label: "Sleep" },
] as const

// ============================================================================
// COMMON PROCEDURES (CHO-level)
// ============================================================================

export const COMMON_PROCEDURES = [
  { value: "wound_cleaning", label: "Wound Cleaning", category: "wound" },
  { value: "wound_dressing", label: "Wound Dressing", category: "wound" },
  { value: "suturing", label: "Suturing", category: "wound" },
  { value: "suture_removal", label: "Suture Removal", category: "wound" },
  { value: "debridement", label: "Debridement", category: "wound" },
  { value: "incision_drainage", label: "Incision & Drainage", category: "wound" },
  { value: "nebulization", label: "Nebulization", category: "respiratory" },
  { value: "oxygen_therapy", label: "Oxygen Therapy", category: "respiratory" },
  { value: "injection_im", label: "IM Injection", category: "injection" },
  { value: "injection_iv", label: "IV Injection", category: "injection" },
  { value: "injection_sc", label: "SC Injection", category: "injection" },
  { value: "ivf_insertion", label: "IV Fluid Insertion", category: "injection" },
  { value: "ear_irrigation", label: "Ear Irrigation", category: "ent" },
  { value: "fb_removal_ear", label: "FB Removal - Ear", category: "ent" },
  { value: "fb_removal_eye", label: "FB Removal - Eye", category: "ent" },
  { value: "eye_irrigation", label: "Eye Irrigation", category: "ent" },
  { value: "splinting", label: "Splinting", category: "ortho" },
  { value: "bandaging", label: "Bandaging", category: "ortho" },
  { value: "ecg", label: "ECG", category: "diagnostic" },
  { value: "rbs", label: "Random Blood Sugar", category: "diagnostic" },
  { value: "urinalysis_dipstick", label: "Urinalysis (Dipstick)", category: "diagnostic" },
] as const

export type CommonProcedureValue = (typeof COMMON_PROCEDURES)[number]["value"]

export function getProceduresByCategory(category: string) {
  return COMMON_PROCEDURES.filter((p) => p.category === category)
}

// ============================================================================
// COMMON ADVICE TEMPLATES
// ============================================================================

export const COMMON_ADVICE = [
  { value: "increase_fluids", label: "Increase oral fluid intake" },
  { value: "bed_rest", label: "Adequate bed rest" },
  { value: "return_if_worse", label: "Return if symptoms worsen" },
  { value: "complete_meds", label: "Complete prescribed medications" },
  { value: "avoid_strenuous", label: "Avoid strenuous activity" },
  { value: "monitor_temp", label: "Monitor temperature regularly" },
  { value: "soft_diet", label: "Soft diet as tolerated" },
  { value: "cold_compress", label: "Apply cold compress as needed" },
  { value: "warm_compress", label: "Apply warm compress as needed" },
  { value: "elevate_affected", label: "Elevate affected area" },
  { value: "wound_care", label: "Keep wound clean and dry" },
  { value: "no_smoking", label: "Avoid smoking" },
  { value: "no_alcohol", label: "Avoid alcohol" },
  { value: "low_salt", label: "Low salt diet" },
  { value: "low_sugar", label: "Low sugar diet" },
  { value: "high_fiber", label: "High fiber diet" },
  { value: "exercise_regular", label: "Regular exercise as tolerated" },
  { value: "follow_up", label: "Follow-up as scheduled" },
] as const

export type CommonAdviceValue = (typeof COMMON_ADVICE)[number]["value"]

// ============================================================================
// FAMILY HISTORY ITEMS
// ============================================================================

export const FAMILY_HISTORY_ITEMS = [
  { value: "diabetes", label: "Diabetes" },
  { value: "hypertension", label: "Hypertension" },
  { value: "cancer", label: "Cancer" },
  { value: "heartDisease", label: "Heart Disease" },
  { value: "stroke", label: "Stroke" },
  { value: "asthma", label: "Asthma" },
  { value: "mentalIllness", label: "Mental Illness" },
  { value: "kidneyDisease", label: "Kidney Disease" },
] as const

export const FAMILY_RELATIONS = [
  { value: "mother", label: "Mother" },
  { value: "father", label: "Father" },
  { value: "sibling", label: "Sibling" },
  { value: "grandparent", label: "Grandparent" },
  { value: "aunt_uncle", label: "Aunt/Uncle" },
  { value: "multiple", label: "Multiple Relatives" },
] as const

// ============================================================================
// COMMON LAB TESTS (for quick ordering)
// ============================================================================

export const COMMON_LAB_TESTS = [
  { value: "cbc", label: "Complete Blood Count (CBC)", category: "hematology" },
  { value: "urinalysis", label: "Urinalysis", category: "urinalysis" },
  { value: "fbs", label: "Fasting Blood Sugar", category: "chemistry" },
  { value: "rbs", label: "Random Blood Sugar", category: "chemistry" },
  { value: "hba1c", label: "HbA1c", category: "chemistry" },
  { value: "lipid_profile", label: "Lipid Profile", category: "chemistry" },
  { value: "creatinine", label: "Creatinine", category: "chemistry" },
  { value: "bun", label: "BUN", category: "chemistry" },
  { value: "sgpt", label: "SGPT/ALT", category: "chemistry" },
  { value: "sgot", label: "SGOT/AST", category: "chemistry" },
  { value: "uric_acid", label: "Uric Acid", category: "chemistry" },
  { value: "chest_xray", label: "Chest X-ray", category: "imaging" },
  { value: "ecg", label: "ECG/EKG", category: "diagnostic" },
  { value: "stool_exam", label: "Stool Examination", category: "other" },
  { value: "sputum_afb", label: "Sputum AFB", category: "microbiology" },
  { value: "dengue_ns1", label: "Dengue NS1", category: "serology" },
  { value: "typhidot", label: "Typhidot", category: "serology" },
  { value: "hbsag", label: "HBsAg", category: "serology" },
  { value: "pregnancy_test", label: "Pregnancy Test", category: "other" },
] as const

export type CommonLabTestValue = (typeof COMMON_LAB_TESTS)[number]["value"]

export function getLabTestsByCategory(category: string) {
  return COMMON_LAB_TESTS.filter((t) => t.category === category)
}
