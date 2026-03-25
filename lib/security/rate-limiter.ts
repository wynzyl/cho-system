/**
 * In-memory rate limiter for login attempts
 * Prevents brute force attacks by tracking attempts per IP and email
 */

interface AttemptRecord {
  attempts: number
  firstAttemptAt: number
  lockoutUntil: number | null
  lockoutCount: number // For exponential backoff
}

interface RateLimitResult {
  allowed: boolean
  retryAfterMs: number | null
  reason: string | null
}

// Configuration
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const BASE_LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes
const MAX_LOCKOUT_MS = 60 * 60 * 1000 // 1 hour max
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000 // Clean up every 5 minutes

// In-memory storage
const ipAttempts = new Map<string, AttemptRecord>()
const emailAttempts = new Map<string, AttemptRecord>()

// Cleanup stale records periodically
let cleanupInterval: NodeJS.Timeout | null = null

function startCleanup() {
  if (cleanupInterval) return

  cleanupInterval = setInterval(() => {
    const now = Date.now()

    // Clean up IP records
    for (const [key, record] of ipAttempts.entries()) {
      const windowExpired = now - record.firstAttemptAt > WINDOW_MS
      const lockoutExpired = !record.lockoutUntil || now > record.lockoutUntil

      if (windowExpired && lockoutExpired) {
        ipAttempts.delete(key)
      }
    }

    // Clean up email records
    for (const [key, record] of emailAttempts.entries()) {
      const windowExpired = now - record.firstAttemptAt > WINDOW_MS
      const lockoutExpired = !record.lockoutUntil || now > record.lockoutUntil

      if (windowExpired && lockoutExpired) {
        emailAttempts.delete(key)
      }
    }
  }, CLEANUP_INTERVAL_MS)

  // Don't prevent process exit
  cleanupInterval.unref()
}

function getOrCreateRecord(map: Map<string, AttemptRecord>, key: string): AttemptRecord {
  const existing = map.get(key)
  const now = Date.now()

  if (existing) {
    // Reset if window has expired and not locked out
    if (now - existing.firstAttemptAt > WINDOW_MS && !existing.lockoutUntil) {
      const newRecord: AttemptRecord = {
        attempts: 0,
        firstAttemptAt: now,
        lockoutUntil: null,
        lockoutCount: existing.lockoutCount, // Preserve lockout count for exponential backoff
      }
      map.set(key, newRecord)
      return newRecord
    }
    return existing
  }

  const newRecord: AttemptRecord = {
    attempts: 0,
    firstAttemptAt: now,
    lockoutUntil: null,
    lockoutCount: 0,
  }
  map.set(key, newRecord)
  return newRecord
}

function calculateLockoutDuration(lockoutCount: number): number {
  // Exponential backoff: 15min, 30min, 60min (capped)
  const duration = BASE_LOCKOUT_MS * Math.pow(2, lockoutCount)
  return Math.min(duration, MAX_LOCKOUT_MS)
}

/**
 * Check if a login attempt is allowed
 * @param ip - Client IP address
 * @param email - Login email (normalized to lowercase)
 * @returns Object indicating if attempt is allowed and retry time if not
 */
export function checkRateLimit(ip: string, email: string): RateLimitResult {
  startCleanup()

  const now = Date.now()
  const normalizedEmail = email.toLowerCase()

  const ipRecord = getOrCreateRecord(ipAttempts, ip)
  const emailRecord = getOrCreateRecord(emailAttempts, normalizedEmail)

  // Check IP lockout
  if (ipRecord.lockoutUntil && now < ipRecord.lockoutUntil) {
    return {
      allowed: false,
      retryAfterMs: ipRecord.lockoutUntil - now,
      reason: "Too many login attempts from this IP address",
    }
  }

  // Check email lockout
  if (emailRecord.lockoutUntil && now < emailRecord.lockoutUntil) {
    return {
      allowed: false,
      retryAfterMs: emailRecord.lockoutUntil - now,
      reason: "Too many login attempts for this account",
    }
  }

  // Clear expired lockouts
  if (ipRecord.lockoutUntil && now >= ipRecord.lockoutUntil) {
    ipRecord.lockoutUntil = null
    ipRecord.attempts = 0
    ipRecord.firstAttemptAt = now
  }

  if (emailRecord.lockoutUntil && now >= emailRecord.lockoutUntil) {
    emailRecord.lockoutUntil = null
    emailRecord.attempts = 0
    emailRecord.firstAttemptAt = now
  }

  return {
    allowed: true,
    retryAfterMs: null,
    reason: null,
  }
}

/**
 * Record a failed login attempt
 * @param ip - Client IP address
 * @param email - Login email
 */
export function recordFailedAttempt(ip: string, email: string): void {
  startCleanup()

  const now = Date.now()
  const normalizedEmail = email.toLowerCase()

  const ipRecord = getOrCreateRecord(ipAttempts, ip)
  const emailRecord = getOrCreateRecord(emailAttempts, normalizedEmail)

  ipRecord.attempts++
  emailRecord.attempts++

  // Apply lockout if max attempts exceeded
  if (ipRecord.attempts >= MAX_ATTEMPTS) {
    const lockoutDuration = calculateLockoutDuration(ipRecord.lockoutCount)
    ipRecord.lockoutUntil = now + lockoutDuration
    ipRecord.lockoutCount++
  }

  if (emailRecord.attempts >= MAX_ATTEMPTS) {
    const lockoutDuration = calculateLockoutDuration(emailRecord.lockoutCount)
    emailRecord.lockoutUntil = now + lockoutDuration
    emailRecord.lockoutCount++
  }
}

/**
 * Clear rate limit records on successful login
 * @param ip - Client IP address
 * @param email - Login email
 */
export function recordSuccessfulLogin(ip: string, email: string): void {
  const normalizedEmail = email.toLowerCase()

  // Clear records on successful login
  ipAttempts.delete(ip)
  emailAttempts.delete(normalizedEmail)
}

/**
 * Get remaining attempts before lockout (for testing/debugging)
 */
export function getRemainingAttempts(ip: string, email: string): { ip: number; email: number } {
  const normalizedEmail = email.toLowerCase()
  const ipRecord = ipAttempts.get(ip)
  const emailRecord = emailAttempts.get(normalizedEmail)

  return {
    ip: MAX_ATTEMPTS - (ipRecord?.attempts ?? 0),
    email: MAX_ATTEMPTS - (emailRecord?.attempts ?? 0),
  }
}
