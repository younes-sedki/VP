/**
 * Client-side CSRF token utilities
 * Fetches CSRF token from server for use in API requests
 */

let csrfToken: string | null = null
let tokenPromise: Promise<string> | null = null

/**
 * Get CSRF token (cached)
 */
export async function getCsrfToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken
  }

  if (tokenPromise) {
    return tokenPromise
  }

  tokenPromise = fetch('/api/csrf-token')
    .then(res => res.json())
    .then(data => {
      csrfToken = data.token
      return csrfToken!
    })
    .catch(() => {
      tokenPromise = null
      throw new Error('Failed to get CSRF token')
    })

  return tokenPromise
}

/**
 * Clear cached CSRF token (for testing or logout)
 */
export function clearCsrfToken(): void {
  csrfToken = null
  tokenPromise = null
}
