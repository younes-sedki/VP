import crypto from 'crypto'

const COOKIE_NAME = 'admin_session'

type AdminSessionPayload = {
  exp: number // unix ms
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input)
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}

function base64UrlDecode(input: string): string {
  const padded = input.replaceAll('-', '+').replaceAll('_', '/')
  // pad to multiple of 4
  const padLen = (4 - (padded.length % 4)) % 4
  const withPad = padded + '='.repeat(padLen)
  return Buffer.from(withPad, 'base64').toString('utf8')
}

function sign(payloadB64: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url')
}

export function getAdminCookieName(): string {
  return COOKIE_NAME
}

export function createAdminSessionToken(opts?: { maxAgeMs?: number }): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV === 'production' ? '' : 'dev-insecure-admin-session-secret')
  if (!secret) throw new Error('Missing ADMIN_SESSION_SECRET')

  const maxAgeMs = opts?.maxAgeMs ?? 7 * 24 * 60 * 60 * 1000
  const payload: AdminSessionPayload = { exp: Date.now() + maxAgeMs }
  const payloadB64 = base64UrlEncode(JSON.stringify(payload))
  const sig = sign(payloadB64, secret)
  return `${payloadB64}.${sig}`
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token) return false
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV === 'production' ? '' : 'dev-insecure-admin-session-secret')
  if (!secret) return false

  const [payloadB64, sig] = token.split('.')
  if (!payloadB64 || !sig) return false

  const expected = sign(payloadB64, secret)
  // timingSafeEqual requires same length buffers
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  if (!crypto.timingSafeEqual(a, b)) return false

  try {
    const payload = JSON.parse(base64UrlDecode(payloadB64)) as AdminSessionPayload
    if (!payload?.exp || typeof payload.exp !== 'number') return false
    return Date.now() < payload.exp
  } catch {
    return false
  }
}

