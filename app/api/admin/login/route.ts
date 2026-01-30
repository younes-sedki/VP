import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { sanitizeInput } from '@/lib/validation'
import { createAdminSessionToken, getAdminCookieName } from '@/lib/admin-session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const password = sanitizeInput(body.password || '')

    const expected = process.env.ADMIN_PASSWORD || 'younes123'
    if (!expected || password !== expected) {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 })
    }

    const token = createAdminSessionToken()
    const cookieName = getAdminCookieName()

    const store = await cookies()
    store.set(cookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // seconds
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 })
  }
}

