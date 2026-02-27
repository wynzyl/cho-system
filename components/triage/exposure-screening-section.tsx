"use client"

import { UseFormReturn } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { EXPOSURE_FLAGS } from "@/lib/constants"
import { AlertTriangle, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExposureScreeningSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  disabled?: boolean
}

export function ExposureScreeningSection({ form, disabled = false }: ExposureScreeningSectionProps) {
  const selectedFlags = form.watch("exposureFlags") || []

  const toggleFlag = (flag: string) => {
    const current = form.getValues("exposureFlags") || []
    if (current.includes(flag)) {
      form.setValue(
        "exposureFlags",
        current.filter((f: string) => f !== flag)
      )
    } else {
      form.setValue("exposureFlags", [...current, flag])
    }
  }

  const hasHighRiskExposure = selectedFlags.some((flag: string) => {
    const exposure = EXPOSURE_FLAGS.find((e) => e.value === flag)
    return exposure?.color === "red" || exposure?.color === "orange"
  })

  return (
    <div
      className={cn(
        "space-y-4 rounded-lg border p-4",
        hasHighRiskExposure && "border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
      )}
    >
      <h3 className="flex items-center gap-2 font-medium">
        <ShieldAlert className="h-4 w-4 text-orange-500" />
        Exposure Screening
        {hasHighRiskExposure && (
          <Badge variant="destructive" className="ml-2">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Exposure Alert
          </Badge>
        )}
      </h3>

      <p className="text-sm text-muted-foreground">
        Check any relevant exposures for public health tracking
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {EXPOSURE_FLAGS.map((exposure) => {
          const isSelected = selectedFlags.includes(exposure.value)
          const colorClasses = {
            red: "text-red-600 dark:text-red-400",
            orange: "text-orange-600 dark:text-orange-400",
            yellow: "text-yellow-600 dark:text-yellow-400",
            blue: "text-blue-600 dark:text-blue-400",
            gray: "text-gray-600 dark:text-gray-400",
          }
          return (
            <div
              key={exposure.value}
              className={cn(
                "flex items-start space-x-3 rounded-md border p-3 transition-colors",
                isSelected && "border-primary bg-primary/5",
                disabled && "opacity-50"
              )}
            >
              <Checkbox
                id={exposure.value}
                checked={isSelected}
                onCheckedChange={() => !disabled && toggleFlag(exposure.value)}
                disabled={disabled}
              />
              <div className="space-y-1">
                <label
                  htmlFor={exposure.value}
                  className={cn(
                    "cursor-pointer text-sm font-medium leading-none",
                    disabled && "cursor-not-allowed"
                  )}
                >
                  {exposure.label}
                </label>
                {exposure.alert && (
                  <Badge
                    variant="outline"
                    className={cn("text-xs", colorClasses[exposure.color as keyof typeof colorClasses])}
                  >
                    {exposure.alert}
                  </Badge>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Exposure Notes */}
      {selectedFlags.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="exposureNotes" className="text-sm">
            Exposure Details
          </Label>
          <Textarea
            id="exposureNotes"
            placeholder="Provide details about the exposure (e.g., date of exposure, circumstances)..."
            {...form.register("exposureNotes")}
            disabled={disabled}
            rows={2}
            className="resize-none"
          />
        </div>
      )}
    </div>
  )
}
