/**
 * Next.js Instrumentation Hook
 * Runs at server startup to validate environment configuration
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run validation on Node.js runtime (not Edge)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateRequiredEnvVars } = await import("@/lib/security/env-validator")

    try {
      validateRequiredEnvVars()
    } catch (error) {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    }
  }
}
