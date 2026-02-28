"use client"

import { Button } from "@/components/ui/button"

interface YesNoToggleProps {
  value: boolean | null
  onChange: (value: boolean) => void
  disabled?: boolean
  size?: "sm" | "default"
}

export function YesNoToggle({
  value,
  onChange,
  disabled = false,
  size = "sm",
}: YesNoToggleProps) {
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant={value === true ? "default" : "outline"}
        size={size}
        disabled={disabled}
        onClick={() => onChange(true)}
      >
        Yes
      </Button>
      <Button
        type="button"
        variant={value === false ? "default" : "outline"}
        size={size}
        disabled={disabled}
        onClick={() => onChange(false)}
      >
        No
      </Button>
    </div>
  )
}
