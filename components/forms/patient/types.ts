/**
 * Shared types for patient form sections
 */

import type { UseFormReturn } from "react-hook-form"
import type { PatientFormData } from "@/lib/validators/patient-form"
import type { BarangayOption } from "@/actions/patients"

/**
 * Props passed to each patient form section
 */
export interface PatientFormSectionProps {
  /** React Hook Form instance */
  form: UseFormReturn<PatientFormData>
}

/**
 * Props for sections that need barangay data
 */
export interface AddressSectionProps extends PatientFormSectionProps {
  barangays: BarangayOption[]
}
