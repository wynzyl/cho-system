import { FieldError, UseFormRegister, Path, FieldValues } from "react-hook-form"
import { LucideIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface VitalInputProps<T extends FieldValues> {
  id: Path<T>
  label: string
  icon: LucideIcon
  iconColor: string
  unit?: string
  placeholder?: string
  register: UseFormRegister<T>
  error?: FieldError
  disabled?: boolean
  type?: "text" | "number"
  step?: string
  className?: string
  required?: boolean
}

export function VitalInput<T extends FieldValues>({
  id,
  label,
  icon: Icon,
  iconColor,
  unit,
  placeholder,
  register,
  error,
  disabled = false,
  type = "number",
  step,
  className = "",
  required = true,
}: VitalInputProps<T>) {
  const displayLabel = unit ? `${label} (${unit})` : label

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${iconColor}`} />
        {displayLabel}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        placeholder={placeholder}
        {...register(id)}
        disabled={disabled}
        type={type}
        step={step}
        required={required}
        aria-invalid={!!error}
      />
      {error && (
        <p className="text-sm text-destructive" role="alert" aria-live="assertive">{error.message}</p>
      )}
    </div>
  )
}
