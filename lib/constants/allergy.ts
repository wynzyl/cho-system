export const ALLERGY_SEVERITY_OPTIONS = [
  { value: "MILD", label: "Mild", color: "yellow" },
  { value: "MODERATE", label: "Moderate", color: "orange" },
  { value: "SEVERE", label: "Severe", color: "red" },
] as const

export const ALLERGY_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "RESOLVED", label: "Resolved" },
] as const

export const PATIENT_ALLERGY_STATUS_OPTIONS = [
  { value: "UNKNOWN", label: "Unknown", description: "Allergy status unconfirmed" },
  { value: "NKA", label: "NKA", description: "No Known Allergies" },
  { value: "HAS_ALLERGIES", label: "Has Allergies", description: "Patient has documented allergies" },
] as const

export type AllergySeverityValue = (typeof ALLERGY_SEVERITY_OPTIONS)[number]["value"]
export type AllergyStatusValue = (typeof ALLERGY_STATUS_OPTIONS)[number]["value"]
export type PatientAllergyStatusValue = (typeof PATIENT_ALLERGY_STATUS_OPTIONS)[number]["value"]

export const COMMON_ALLERGENS = [
  // Drugs
  { category: "Drug", name: "Penicillin" },
  { category: "Drug", name: "Amoxicillin" },
  { category: "Drug", name: "Sulfonamides (Sulfa)" },
  { category: "Drug", name: "NSAIDs (Aspirin, Ibuprofen)" },
  { category: "Drug", name: "Cephalosporins" },
  { category: "Drug", name: "Tetracycline" },
  { category: "Drug", name: "Metformin" },
  { category: "Drug", name: "ACE Inhibitors" },
  { category: "Drug", name: "Codeine" },
  { category: "Drug", name: "Morphine" },
  // Foods
  { category: "Food", name: "Shellfish/Seafood" },
  { category: "Food", name: "Peanuts" },
  { category: "Food", name: "Tree Nuts" },
  { category: "Food", name: "Eggs" },
  { category: "Food", name: "Milk/Dairy" },
  { category: "Food", name: "Soy" },
  { category: "Food", name: "Wheat/Gluten" },
  { category: "Food", name: "Fish" },
  // Environmental
  { category: "Environmental", name: "Latex" },
  { category: "Environmental", name: "Bee Stings" },
  { category: "Environmental", name: "Iodine/Contrast Dye" },
  { category: "Environmental", name: "Dust Mites" },
  { category: "Environmental", name: "Pollen" },
  { category: "Environmental", name: "Mold" },
  { category: "Environmental", name: "Pet Dander" },
] as const

export const ALLERGEN_CATEGORIES = ["Drug", "Food", "Environmental", "Other"] as const

export type AllergenCategory = (typeof ALLERGEN_CATEGORIES)[number]

export function getAllergensByCategory(category: string) {
  return COMMON_ALLERGENS.filter((a) => a.category === category)
}

export function getSeverityColor(severity: AllergySeverityValue): string {
  switch (severity) {
    case "MILD":
      return "yellow"
    case "MODERATE":
      return "orange"
    case "SEVERE":
      return "red"
    default:
      return "gray"
  }
}
