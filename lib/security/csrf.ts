/**
 * CSRF Protection utilities
 * Provides defense-in-depth by validating Origin headers for Server Actions
 */

/**
 * Validate that the Origin header matches the request host
 * @param origin - Origin header value (e.g., "https://example.com")
 * @param host - Host header value (e.g., "example.com" or "localhost:3000")
 * @returns true if origin matches host, false otherwise
 */
export function validateOrigin(origin: string | null, host: string | null): boolean {
  // Missing headers fail validation
  if (!origin || !host) {
    return false
  }

  try {
    const originUrl = new URL(origin)
    const originHost = originUrl.host // includes port if present

    // Compare the host portions
    return originHost === host
  } catch {
    // Invalid URL in origin header
    return false
  }
}

/**
 * Check if a request is a Server Action request
 * Server Actions use POST with specific headers
 * @param request - NextRequest object
 * @returns true if this appears to be a Server Action request
 */
export function isServerActionRequest(request: {
  method: string
  headers: { get: (name: string) => string | null }
}): boolean {
  // Must be POST
  if (request.method !== "POST") {
    return false
  }

  // Next.js Server Actions always include the next-action header
  // This is the definitive indicator - content-type alone is not sufficient
  // as regular form POSTs use the same content-types but are NOT Server Actions
  const nextAction = request.headers.get("next-action")
  return !!nextAction
}
