import { ReactNode } from "react"
import { Label } from "@/components/ui/label"

interface FormFieldProps {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  children: ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={htmlFor} className="flex items-center gap-2">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
