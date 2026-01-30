import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminCookieName } from '@/lib/admin-session'

export async function POST(_request: NextRequest) {
  const store = await cookies()
  store.set(getAdminCookieName(), '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
  return NextResponse.json({ success: true })
}

