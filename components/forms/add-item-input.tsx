"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AddItemInputProps {
  placeholder: string
  onAdd: (value: string) => void
  disabled?: boolean
}

export function AddItemInput({ placeholder, onAdd, disabled = false }: AddItemInputProps) {
  const [value, setValue] = useState("")

  const handleAdd = () => {
    if (!value.trim()) return
    onAdd(value.trim())
    setValue("")
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
        disabled={disabled}
        className="h-8"
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleAdd}
        disabled={disabled || !value.trim()}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
