/**
 * FormFieldGroup - Consistent wrapper for form fields
 * Wraps Label + Input/Select + Error in a consistent pattern
 */

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { FormErrorMessage } from "@/components/ui/form-error-message"

interface FormFieldGroupProps {
  /** Field label text */
  label: string
  /** HTML id for the input (used for htmlFor on label) */
  htmlFor?: string
  /** Mark field as required (shows asterisk) */
  required?: boolean
  /** Error message to display */
  error?: string
  /** Additional description text below the field */
  description?: string
  /** Form field element (Input, Select, etc.) */
  children: React.ReactNode
  /** Additional CSS classes for the container */
  className?: string
  /** Use muted label style (for optional fields) */
  mutedLabel?: boolean
  /** Animation delay in ms (for staggered animations) */
  animationDelay?: number
  /** Icon to display in label */
  icon?: React.ReactNode
}

/**
 * Wraps a form field with consistent Label + Error pattern
 * Reduces boilerplate in form components
 */
export function FormFieldGroup({
  label,
  htmlFor,
  required = false,
  error,
  description,
  children,
  className,
  mutedLabel = false,
  animationDelay,
  icon,
}: FormFieldGroupProps) {
  return (
    <div
      className={cn("space-y-2", animationDelay !== undefined && "clinical-animate-in", className)}
      style={animationDelay !== undefined ? { animationDelay: `${animationDelay}ms` } : undefined}
    >
      <Label
        htmlFor={htmlFor}
        className={cn(
          "text-sm font-medium",
          mutedLabel && "text-muted-foreground",
          icon && "flex items-center gap-2"
        )}
      >
        {icon}
        {label}
        {required && <span className="clinical-required ml-1">*</span>}
      </Label>

      {children}

      <FormErrorMessage message={error} />

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

interface FormFieldWrapperProps {
  /** Children elements */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
  /** Animation delay in ms */
  animationDelay?: number
}

/**
 * Simple animated wrapper for form fields without label
 * Used when Label is already included or for custom layouts
 */
export function FormFieldWrapper({
  children,
  className,
  animationDelay,
}: FormFieldWrapperProps) {
  return (
    <div
      className={cn(
        "space-y-2",
        animationDelay !== undefined && "clinical-animate-in",
        className
      )}
      style={animationDelay !== undefined ? { animationDelay: `${animationDelay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
