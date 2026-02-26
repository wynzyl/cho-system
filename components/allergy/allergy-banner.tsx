"use client"

import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react"
import { PatientAllergyStatus, AllergySeverity } from "@prisma/client"
import { cn } from "@/lib/utils"

interface AllergyBannerProps {
  status: PatientAllergyStatus
  allergies?: {
    allergen: string
    severity: AllergySeverity
  }[]
  className?: string
  compact?: boolean
}

function getSeverityIndicator(severity: AllergySeverity) {
  switch (severity) {
    case "SEVERE":
      return "bg-red-500"
    case "MODERATE":
      return "bg-amber-500"
    case "MILD":
      return "bg-yellow-400"
  }
}

export function AllergyBanner({
  status,
  allergies = [],
  className,
  compact = false,
}: AllergyBannerProps) {
  const activeAllergies = allergies.filter((a) => a)

  if (status === "HAS_ALLERGIES" && activeAllergies.length > 0) {
    return (
      <div
        className={cn(
          "allergy-banner-danger relative overflow-hidden rounded-lg border-2 border-red-500/30",
          "bg-linear-to-r from-red-950/90 via-red-900/80 to-red-950/90",
          compact ? "px-3 py-2" : "px-4 py-3",
          className
        )}
      >
        {/* Animated danger stripe pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 8px,
            currentColor 8px,
            currentColor 16px
          )`,
        }} />

        <div className="relative flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/20 ring-2 ring-red-500/40">
            <AlertTriangle className="h-4 w-4 text-red-400 animate-pulse" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                Allergies
              </span>
              <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-300">
                {activeAllergies.length}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              {activeAllergies.map((allergy, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-md bg-red-500/10 px-2 py-0.5 text-sm font-medium text-red-100 ring-1 ring-inset ring-red-500/20"
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      getSeverityIndicator(allergy.severity)
                    )}
                  />
                  {allergy.allergen}
                  {allergy.severity === "SEVERE" && (
                    <span className="text-[10px] font-bold text-red-400">!</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === "NKA") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border border-emerald-500/30",
          "bg-linear-to-r from-emerald-950/80 via-emerald-900/60 to-emerald-950/80",
          compact ? "px-3 py-2" : "px-4 py-3",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/30">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>

          <div>
            <span className="text-sm font-semibold text-emerald-300">
              No Known Allergies
            </span>
            <span className="ml-2 text-xs text-emerald-400/70">(NKA)</span>
          </div>
        </div>
      </div>
    )
  }

  // UNKNOWN status
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-amber-500/30",
        "bg-linear-to-r from-amber-950/80 via-amber-900/60 to-amber-950/80",
        compact ? "px-3 py-2" : "px-4 py-3",
        className
      )}
    >
      {/* Subtle warning pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `repeating-linear-gradient(
          90deg,
          transparent,
          transparent 4px,
          currentColor 4px,
          currentColor 8px
        )`,
      }} />

      <div className="relative flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 ring-1 ring-amber-500/30">
          <HelpCircle className="h-4 w-4 text-amber-400" />
        </div>

        <div>
          <span className="text-sm font-semibold text-amber-300">
            Allergy Status Unconfirmed
          </span>
          <span className="ml-2 text-xs text-amber-400/70">Please verify</span>
        </div>
      </div>
    </div>
  )
}
