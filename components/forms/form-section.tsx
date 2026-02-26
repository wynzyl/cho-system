import { ReactNode } from "react"
import { LucideIcon } from "lucide-react"

interface FormSectionProps {
  icon: LucideIcon
  title: string
  children: ReactNode
  className?: string
  columns?: 2 | 3
}

export function FormSection({
  icon: Icon,
  title,
  children,
  className = "",
  columns,
}: FormSectionProps) {
  const gridClass = columns === 3
    ? "grid gap-4 md:grid-cols-3"
    : columns === 2
      ? "grid gap-4 md:grid-cols-2"
      : ""

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 border-b pb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className={gridClass}>
        {children}
      </div>
    </div>
  )
}
