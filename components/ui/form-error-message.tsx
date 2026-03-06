/**
 * FormErrorMessage - Consistent error display for form fields
 * Consolidates 8+ duplicate error display patterns across forms
 */

import { cn } from "@/lib/utils"

interface FormErrorMessageProps {
  /** The error message to display */
  message?: string
  /** Additional CSS classes */
  className?: string
  /** Show dot indicator before message (default: true) */
  showDot?: boolean
}

/**
 * Displays a form field error message with consistent styling
 * Used for individual field errors below inputs
 */
export function FormErrorMessage({
  message,
  className,
  showDot = true,
}: FormErrorMessageProps) {
  if (!message) return null

  return (
    <p className={cn("text-xs text-destructive flex items-center gap-1", className)}>
      {showDot && <span className="h-1 w-1 rounded-full bg-destructive" />}
      {message}
    </p>
  )
}

interface FormErrorBannerProps {
  /** The error message to display */
  message?: string | null
  /** Additional CSS classes */
  className?: string
}

/**
 * Displays a prominent error banner at the top of forms
 * Used for general form-level errors (e.g., API errors)
 */
export function FormErrorBanner({ message, className }: FormErrorBannerProps) {
  if (!message) return null

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive",
        className
      )}
    >
      <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
      {message}
    </div>
  )
}

/**
 * Compact error banner variant for dialogs and smaller forms
 */
export function FormErrorBannerCompact({ message, className }: FormErrorBannerProps) {
  if (!message) return null

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
      {message}
    </div>
  )
}
