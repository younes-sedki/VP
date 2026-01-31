/**
 * CSRF (Cross-Site Request Forgery) Protection
 * Generates and validates CSRF tokens for form submissions
 */

import { cookies } from 'next/headers'
import crypto from 'crypto'

const CSRF_TOKEN_COOKIE = 'csrf-token'
const CSRF_TOKEN_HEADER = 'X-CSRF-Token'
const TOKEN_EXPIRY = 60 * 60 * 24 // 24 hours in seconds

/**
 * Generate a new CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Get or create CSRF token from cookie
 */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies()
  let token = cookieStore.get(CSRF_TOKEN_COOKIE)?.value

  if (!token) {
    token = generateCsrfToken()
    cookieStore.set(CSRF_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: TOKEN_EXPIRY,
      path: '/',
    })
  }

  return token
}

/**
 * Validate CSRF token from request
 */
export async function validateCsrfToken(request: Request): Promise<boolean> {
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(CSRF_TOKEN_COOKIE)?.value

  if (!cookieToken) {
    return false
  }

  const headerToken = request.headers.get(CSRF_TOKEN_HEADER)

  if (!headerToken) {
    return false
  }

  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(headerToken)
  )
}

/**
 * Verify origin/referer headers for additional CSRF protection
 */
export function verifyOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')

  if (!host) return false

  // In production, verify origin matches host
  if (process.env.NODE_ENV === 'production') {
    if (origin && !origin.includes(host)) {
      return false
    }
    if (referer && !referer.includes(host)) {
      return false
    }
  }

  return true
}
