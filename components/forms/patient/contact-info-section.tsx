/**
 * Contact Info Section - Education, Employment, Phone, Address
 */

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EDUCATION_OPTIONS } from "@/lib/constants"
import { GraduationCap, Briefcase, Phone, MapPin, FileText } from "lucide-react"
import { FormSection } from "@/components/forms/section-header"
import { FormFieldWrapper } from "@/components/forms/form-field-group"
import { FormErrorMessage } from "@/components/ui/form-error-message"
import type { PatientFormSectionProps, AddressSectionProps } from "./types"
import type { PatientFormData } from "@/lib/validators/patient-form"

export function EducationEmploymentSection({ form }: PatientFormSectionProps) {
  return (
    <FormSection icon={GraduationCap} title="Education & Employment" headerDelay={550}>
      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldWrapper animationDelay={600}>
          <Label htmlFor="education" className="text-sm font-medium text-muted-foreground">
            Education Level
          </Label>
          <Select
            value={form.watch("education")}
            onValueChange={(value) =>
              form.setValue("education", value as PatientFormData["education"])
            }
          >
            <SelectTrigger className="bg-input/50 border-border/60 focus:border-primary/60 focus:ring-primary/20">
              <SelectValue placeholder="Select education level" />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldWrapper>

        <FormFieldWrapper animationDelay={650}>
          <Label htmlFor="occupation" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Briefcase className="h-3 w-3" />
            Occupation
          </Label>
          <div className="clinical-input rounded-md">
            <Input
              id="occupation"
              placeholder="e.g., Teacher, Farmer, Engineer"
              {...form.register("occupation")}
              className="bg-input/50 border-border/60 focus-visible:border-primary/60"
            />
          </div>
        </FormFieldWrapper>
      </div>
    </FormSection>
  )
}

export function ContactSection({ form }: PatientFormSectionProps) {
  return (
    <FormSection icon={Phone} title="Contact Information" headerDelay={700}>
      <FormFieldWrapper animationDelay={750}>
        <Label htmlFor="phone" className="text-sm font-medium">
          Phone Number <span className="clinical-required">*</span>
        </Label>
        <div className="clinical-input rounded-md">
          <Input
            id="phone"
            type="tel"
            placeholder="09XX-XXX-XXXX"
            {...form.register("phone")}
            aria-invalid={!!form.formState.errors.phone}
            className="bg-input/50 border-border/60 focus-visible:border-primary/60 font-mono tracking-wide"
          />
        </div>
        <FormErrorMessage message={form.formState.errors.phone?.message} />
      </FormFieldWrapper>
    </FormSection>
  )
}

export function AddressSection({ form, barangays }: AddressSectionProps) {
  return (
    <FormSection icon={MapPin} title="Address" headerDelay={1100}>
      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldWrapper animationDelay={1150}>
          <Label htmlFor="addressLine" className="text-sm font-medium text-muted-foreground">
            Street Address
          </Label>
          <div className="clinical-input rounded-md">
            <Input
              id="addressLine"
              placeholder="House No., Street, Purok, etc."
              {...form.register("addressLine")}
              className="bg-input/50 border-border/60 focus-visible:border-primary/60"
            />
          </div>
        </FormFieldWrapper>

        <FormFieldWrapper animationDelay={1150}>
          <Label htmlFor="barangayId" className="text-sm font-medium">
            Barangay <span className="clinical-required">*</span>
          </Label>
          <Select
            value={form.watch("barangayId") ?? ""}
            onValueChange={(value) => form.setValue("barangayId", value)}
          >
            <SelectTrigger className="bg-input/50 border-border/60 focus:border-primary/60 focus:ring-primary/20">
              <SelectValue placeholder="Select barangay" />
            </SelectTrigger>
            <SelectContent>
              {barangays.map((brgy) => (
                <SelectItem key={brgy.id} value={brgy.id}>
                  {brgy.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormErrorMessage message={form.formState.errors.barangayId?.message} />
        </FormFieldWrapper>
      </div>
    </FormSection>
  )
}

export function NotesSection({ form }: PatientFormSectionProps) {
  return (
    <FormSection icon={FileText} title="Additional Notes" headerDelay={1250}>
      <FormFieldWrapper animationDelay={1300}>
        <div className="clinical-input rounded-md">
          <Textarea
            id="notes"
            placeholder="Medical history, allergies, special instructions..."
            {...form.register("notes")}
            rows={3}
            className="bg-input/50 border-border/60 focus-visible:border-primary/60 resize-none"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Include any relevant medical history or special considerations
        </p>
      </FormFieldWrapper>
    </FormSection>
  )
}
