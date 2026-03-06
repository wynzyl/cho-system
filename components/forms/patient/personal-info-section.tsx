/**
 * Personal Info Section - Patient Identity, Demographics, Personal Info
 */

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CIVIL_STATUS_OPTIONS,
  RELIGION_OPTIONS,
  BLOOD_TYPE_OPTIONS,
} from "@/lib/constants"
import { User, Calendar, Heart, Droplet } from "lucide-react"
import { FormSection } from "@/components/forms/section-header"
import { FormFieldWrapper } from "@/components/forms/form-field-group"
import { FormErrorMessage } from "@/components/ui/form-error-message"
import type { PatientFormSectionProps } from "./types"
import type { PatientFormData } from "@/lib/validators/patient-form"

export function PatientIdentitySection({ form }: PatientFormSectionProps) {
  return (
    <FormSection icon={User} title="Patient Identity" headerDelay={50}>
      <div className="grid gap-4 md:grid-cols-3">
        <FormFieldWrapper animationDelay={100}>
          <Label htmlFor="firstName" className="text-sm font-medium">
            First Name <span className="clinical-required">*</span>
          </Label>
          <div className="clinical-input rounded-md">
            <Input
              id="firstName"
              {...form.register("firstName")}
              aria-invalid={!!form.formState.errors.firstName}
              className="bg-input/50 border-border/60 focus-visible:border-primary/60"
              placeholder="Juan"
            />
          </div>
          <FormErrorMessage message={form.formState.errors.firstName?.message} />
        </FormFieldWrapper>

        <FormFieldWrapper animationDelay={150}>
          <Label htmlFor="middleName" className="text-sm font-medium text-muted-foreground">
            Middle Name
          </Label>
          <div className="clinical-input rounded-md">
            <Input
              id="middleName"
              {...form.register("middleName")}
              className="bg-input/50 border-border/60 focus-visible:border-primary/60"
              placeholder="Santos"
            />
          </div>
        </FormFieldWrapper>

        <FormFieldWrapper animationDelay={200}>
          <Label htmlFor="lastName" className="text-sm font-medium">
            Last Name <span className="clinical-required">*</span>
          </Label>
          <div className="clinical-input rounded-md">
            <Input
              id="lastName"
              {...form.register("lastName")}
              aria-invalid={!!form.formState.errors.lastName}
              className="bg-input/50 border-border/60 focus-visible:border-primary/60"
              placeholder="Dela Cruz"
            />
          </div>
          <FormErrorMessage message={form.formState.errors.lastName?.message} />
        </FormFieldWrapper>
      </div>
    </FormSection>
  )
}

export function DemographicsSection({ form }: PatientFormSectionProps) {
  return (
    <FormSection icon={Calendar} title="Demographics" headerDelay={250}>
      <div className="grid gap-4 md:grid-cols-3">
        <FormFieldWrapper animationDelay={300}>
          <Label htmlFor="birthDate" className="text-sm font-medium">
            Birth Date <span className="clinical-required">*</span>
          </Label>
          <div className="clinical-input rounded-md">
            <Input
              id="birthDate"
              type="date"
              {...form.register("birthDate")}
              aria-invalid={!!form.formState.errors.birthDate}
              className="bg-input/50 border-border/60 focus-visible:border-primary/60"
            />
          </div>
          <FormErrorMessage message={form.formState.errors.birthDate?.message} />
        </FormFieldWrapper>

        <FormFieldWrapper animationDelay={350}>
          <Label htmlFor="sex" className="text-sm font-medium">
            Sex <span className="clinical-required">*</span>
          </Label>
          <Select
            value={form.watch("sex") ?? ""}
            onValueChange={(value) =>
              form.setValue("sex", value as PatientFormData["sex"])
            }
          >
            <SelectTrigger className="bg-input/50 border-border/60 focus:border-primary/60 focus:ring-primary/20">
              <SelectValue placeholder="Select sex" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          <FormErrorMessage message={form.formState.errors.sex?.message} />
        </FormFieldWrapper>

        <FormFieldWrapper animationDelay={375}>
          <Label htmlFor="bloodType" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Droplet className="h-3 w-3" />
            Blood Type
          </Label>
          <Select
            value={form.watch("bloodType")}
            onValueChange={(value) =>
              form.setValue("bloodType", value as PatientFormData["bloodType"])
            }
          >
            <SelectTrigger className="bg-input/50 border-border/60 focus:border-primary/60 focus:ring-primary/20">
              <SelectValue placeholder="Select blood type" />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldWrapper>
      </div>
    </FormSection>
  )
}

export function PersonalInfoSection({ form }: PatientFormSectionProps) {
  return (
    <FormSection icon={Heart} title="Personal Information" headerDelay={400}>
      <div className="grid gap-4 md:grid-cols-2">
        <FormFieldWrapper animationDelay={450}>
          <Label htmlFor="civilStatus" className="text-sm font-medium">
            Civil Status <span className="clinical-required">*</span>
          </Label>
          <Select
            value={form.watch("civilStatus") ?? ""}
            onValueChange={(value) =>
              form.setValue("civilStatus", value as PatientFormData["civilStatus"])
            }
          >
            <SelectTrigger className="bg-input/50 border-border/60 focus:border-primary/60 focus:ring-primary/20">
              <SelectValue placeholder="Select civil status" />
            </SelectTrigger>
            <SelectContent>
              {CIVIL_STATUS_OPTIONS.filter(opt => opt.value !== "UNKNOWN").map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormErrorMessage message={form.formState.errors.civilStatus?.message} />
        </FormFieldWrapper>

        <FormFieldWrapper animationDelay={500}>
          <Label htmlFor="religion" className="text-sm font-medium text-muted-foreground">
            Religion
          </Label>
          <Select
            value={form.watch("religion")}
            onValueChange={(value) =>
              form.setValue("religion", value as PatientFormData["religion"])
            }
          >
            <SelectTrigger className="bg-input/50 border-border/60 focus:border-primary/60 focus:ring-primary/20">
              <SelectValue placeholder="Select religion" />
            </SelectTrigger>
            <SelectContent>
              {RELIGION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldWrapper>
      </div>
    </FormSection>
  )
}
