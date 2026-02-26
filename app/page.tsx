import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-2">Urdaneta City Health Management and Monitoring System</h1>
      <p className="text-muted-foreground mb-6">
        A comprehensive system for managing and monitoring the health of the city&apos;s residents.
      </p>
      <Button asChild>
        <Link href="/login">Sign In</Link>
      </Button>
      <div className="flex flex-col items-center my-6">
       <section className="text-muted-foreground text-sm"> ©copyright 2026 Urdaneta City Health Office</section>
      </div>
    </div>
  )
}