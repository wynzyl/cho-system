/**
 * SectionHeader - Consistent section header for forms
 * Extracted from patient-form.tsx for reuse across form components
 */

import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  /** Icon component to display */
  icon: React.ElementType
  /** Section title text */
  title: string
  /** Animation delay in ms (default: 0) */
  delay?: number
  /** Additional CSS classes */
  className?: string
}

/**
 * Displays a styled section header with icon and title
 * Uses clinical design system styling
 */
export function SectionHeader({
  icon: Icon,
  title,
  delay = 0,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "clinical-section-header clinical-animate-in mb-4",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{title}</span>
    </div>
  )
}

interface FormSectionProps {
  /** Icon component for the header */
  icon: React.ElementType
  /** Section title */
  title: string
  /** Animation delay for header */
  headerDelay?: number
  /** Section content */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * Complete form section with header and content wrapper
 * Provides consistent section structure with clinical styling
 */
export function FormSection({
  icon,
  title,
  headerDelay = 0,
  children,
  className,
}: FormSectionProps) {
  return (
    <section className={cn("clinical-section pl-5", className)}>
      <SectionHeader icon={icon} title={title} delay={headerDelay} />
      {children}
    </section>
  )
}
