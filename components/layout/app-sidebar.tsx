"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Role } from "@prisma/client"
import {
  LayoutDashboard,
  Users,
  Activity,
  Calendar,
  FlaskConical,
  Pill,
  UserCog,
  Settings,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils/index"

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  roles: Role[]
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "REGISTRATION", "TRIAGE", "DOCTOR", "LAB", "PHARMACY"],
  },
  {
    href: "/patients",
    label: "Patients",
    icon: Users,
    roles: ["ADMIN", "REGISTRATION"],
  },
  {
    href: "/triage",
    label: "Triage",
    icon: Activity,
    roles: ["ADMIN", "TRIAGE"],
  },
  {
    href: "/appointments",
    label: "Appointments",
    icon: Calendar,
    roles: ["ADMIN", "REGISTRATION", "TRIAGE", "DOCTOR"],
  },
  {
    href: "/laboratory",
    label: "Laboratory",
    icon: FlaskConical,
    roles: ["ADMIN", "LAB"],
  },
  {
    href: "/pharmacy",
    label: "Pharmacy",
    icon: Pill,
    roles: ["ADMIN", "PHARMACY"],
  },
  {
    href: "/users",
    label: "Users",
    icon: UserCog,
    roles: ["ADMIN"],
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    roles: ["ADMIN"],
  },
]

interface AppSidebarProps {
  role: Role
  onNavigate?: () => void
}

export function AppSidebar({ role, onNavigate }: AppSidebarProps) {
  const pathname = usePathname()

  const visibleItems = navItems.filter((item) => item.roles.includes(role))

  return (
    <nav className="flex flex-col gap-1 p-3">
      {visibleItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href))
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
