/**
 * Environment variable validation utilities
 * Validates critical security-related environment variables at startup
 */

export const MIN_SECRET_LENGTH = 32

/**
 * Validates that SESSION_SECRET exists and meets minimum security requirements
 * @throws Error if SESSION_SECRET is missing or too short
 */
export function validateSessionSecret(): void {
  const secret = process.env.SESSION_SECRET

  if (!secret) {
    throw new Error(
      "[Security] SESSION_SECRET environment variable is not set.\n" +
        "Generate a secure secret with:\n" +
        "  node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    )
  }

  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `[Security] SESSION_SECRET must be at least ${MIN_SECRET_LENGTH} characters.\n` +
        `Current length: ${secret.length}\n` +
        "Generate a secure secret with:\n" +
        "  node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    )
  }
}

/**
 * Runs all required environment variable validations
 * Should be called at application startup
 * @throws Error if any required environment variable is invalid
 */
export function validateRequiredEnvVars(): void {
  validateSessionSecret()

  console.log("[Security] Environment validation passed")
}
