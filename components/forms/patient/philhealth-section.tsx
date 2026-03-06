/**
 * PhilHealth Section - PhilHealth Information
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
import { PHILHEALTH_MEMBERSHIP_TYPE_OPTIONS } from "@/lib/constants"
import { Shield } from "lucide-react"
import { FormSection } from "@/components/forms/section-header"
import { FormFieldWrapper } from "@/components/forms/form-field-group"
import { FormErrorMessage } from "@/components/ui/form-error-message"
import type { PatientFormSectionProps } from "./types"
import type { PatientFormData } from "@/lib/validators/patient-form"

export function PhilHealthSection({ form }: PatientFormSectionProps) {
  return (
    <FormSection icon={Shield} title="PhilHealth Information" headerDelay={800}>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldWrapper animationDelay={850}>
            <Label htmlFor="philhealthNo" className="text-sm font-medium text-muted-foreground">
              PhilHealth Number (PIN)
            </Label>
            <div className="clinical-input rounded-md">
              <Input
                id="philhealthNo"
                placeholder="123456789012"
                maxLength={12}
                {...form.register("philhealthNo")}
                aria-invalid={!!form.formState.errors.philhealthNo}
                className="bg-input/50 border-border/60 focus-visible:border-primary/60 font-mono tracking-wide"
              />
            </div>
            <FormErrorMessage message={form.formState.errors.philhealthNo?.message} />
            <p className="text-xs text-muted-foreground">12-digit PhilHealth Identification Number</p>
          </FormFieldWrapper>

          <FormFieldWrapper animationDelay={900}>
            <Label htmlFor="philhealthMembershipType" className="text-sm font-medium text-muted-foreground">
              Membership Type
            </Label>
            <Select
              value={form.watch("philhealthMembershipType") ?? ""}
              onValueChange={(value) =>
                form.setValue("philhealthMembershipType", value as PatientFormData["philhealthMembershipType"])
              }
            >
              <SelectTrigger className="bg-input/50 border-border/60 focus:border-primary/60 focus:ring-primary/20">
                <SelectValue placeholder="Select membership type" />
              </SelectTrigger>
              <SelectContent>
                {PHILHEALTH_MEMBERSHIP_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormFieldWrapper>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormFieldWrapper animationDelay={950}>
            <Label htmlFor="philhealthEligibilityStart" className="text-sm font-medium text-muted-foreground">
              Eligibility Start Date
            </Label>
            <div className="clinical-input rounded-md">
              <Input
                id="philhealthEligibilityStart"
                type="date"
                {...form.register("philhealthEligibilityStart")}
                className="bg-input/50 border-border/60 focus-visible:border-primary/60"
              />
            </div>
          </FormFieldWrapper>

          <FormFieldWrapper animationDelay={1000}>
            <Label htmlFor="philhealthEligibilityEnd" className="text-sm font-medium text-muted-foreground">
              Eligibility End Date
            </Label>
            <div className="clinical-input rounded-md">
              <Input
                id="philhealthEligibilityEnd"
                type="date"
                {...form.register("philhealthEligibilityEnd")}
                aria-invalid={!!form.formState.errors.philhealthEligibilityEnd}
                className="bg-input/50 border-border/60 focus-visible:border-primary/60"
              />
            </div>
            <FormErrorMessage message={form.formState.errors.philhealthEligibilityEnd?.message} />
          </FormFieldWrapper>
        </div>

        {/* Conditional Principal PIN field - only shown for dependents */}
        {form.watch("philhealthMembershipType") === "DEPENDENT" && (
          <FormFieldWrapper animationDelay={1050}>
            <Label htmlFor="philhealthPrincipalPin" className="text-sm font-medium text-muted-foreground">
              Principal Member&apos;s PhilHealth PIN
            </Label>
            <div className="clinical-input rounded-md">
              <Input
                id="philhealthPrincipalPin"
                placeholder="123456789012"
                maxLength={12}
                {...form.register("philhealthPrincipalPin")}
                aria-invalid={!!form.formState.errors.philhealthPrincipalPin}
                className="bg-input/50 border-border/60 focus-visible:border-primary/60 font-mono tracking-wide"
              />
            </div>
            <FormErrorMessage message={form.formState.errors.philhealthPrincipalPin?.message} />
            <p className="text-xs text-muted-foreground">12-digit PIN of the principal PhilHealth member</p>
          </FormFieldWrapper>
        )}
      </div>
    </FormSection>
  )
}
