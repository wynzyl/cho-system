import { ReactNode } from "react"
import { LucideIcon } from "lucide-react"

interface BackgroundSectionProps {
  icon: LucideIcon
  title: string
  children: ReactNode
  className?: string
}

export function BackgroundSection({
  icon: Icon,
  title,
  children,
  className = "",
}: BackgroundSectionProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="font-medium text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
        <Icon className="h-4 w-4" />
        {title}
      </h3>
      {children}
    </div>
  )
}
