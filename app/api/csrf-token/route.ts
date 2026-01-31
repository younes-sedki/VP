import { NextRequest, NextResponse } from 'next/server'
import { getCsrfToken } from '@/lib/csrf'

export async function GET(request: NextRequest) {
  try {
    const token = await getCsrfToken()
    return NextResponse.json({ token }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}
