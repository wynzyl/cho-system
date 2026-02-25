import { SessionUser } from "@/lib/auth/types"
import { Badge } from "@/components/ui/badge"
import { MobileSidebar } from "./mobile-sidebar"
import { UserMenu } from "./user-menu"
import Link from "next/link"
import Image from "next/image"

interface AppNavbarProps {
  session: SessionUser
  facility: {
    code: string
    name: string
  } | null
}

export function AppNavbar({ session, facility }: AppNavbarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 h-14 border-b bg-card">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <MobileSidebar role={session.role} />
          <Link href="/">
            <Image src="/UCHOlogo.jpg" alt="Urdaneta City Health Office System" width={32} height={32} className="rounded-full" />
          </Link>
          <span className="font-semibold">Urdaneta City Health Management and Monitoring System</span>
        </div>

        <div className="hidden md:flex items-center">
          {facility && (
            <Badge variant="secondary" className="font-normal">
              {facility.code} - {facility.name}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden sm:inline-flex">
            {session.role}
          </Badge>
          <UserMenu userName={session.name} />
        </div>
      </div>
    </header>
  )
}
