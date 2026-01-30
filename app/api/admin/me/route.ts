import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminCookieName, verifyAdminSessionToken } from '@/lib/admin-session'

export async function GET(_request: NextRequest) {
  const store = await cookies()
  const token = store.get(getAdminCookieName())?.value
  const isAdmin = verifyAdminSessionToken(token)
  return NextResponse.json({ loggedIn: isAdmin })
}

