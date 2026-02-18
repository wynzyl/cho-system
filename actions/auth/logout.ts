"use server"

import { destroySession } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function logoutAction(): Promise<never> {
  try {
    await destroySession()
  } catch (error) {
    console.error("Failed to destroy session:", error)
  }
  // redirect throws NEXT_REDIRECT, must be outside try/catch
  redirect("/login")
}
