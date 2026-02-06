import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getResend, EMAIL_FROM, BASE_URL } from '@/lib/resend'
import UnsubscribeEmail from '@/emails/unsubscribe-email'
import type { UnsubscribeResponse } from '@/lib/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── POST /api/newsletter/unsubscribe ───────────────────────────────────────

export async function POST(req: Request): Promise<NextResponse<UnsubscribeResponse>> {
  try {
    const body = await req.json().catch(() => null)

    if (!body?.token || !body?.email) {
      return NextResponse.json(
        { success: false, message: 'Missing fields', error: 'Token and email are required.' },
        { status: 400 }
      )
    }

    const email = body.email.toLowerCase().trim()
    const token = body.token

    // UUID check
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuid.test(token)) {
      return NextResponse.json(
        { success: false, message: 'Invalid token', error: 'Invalid unsubscribe link.' },
        { status: 400 }
      )
    }

    // ── Update subscriber in DB ─────────────────────────────────────────

    const { data, error: dbErr } = await supabase
      .from('newsletter_subscribers')
      .update({ is_active: false })
      .eq('unsubscribe_token', token)
      .eq('email', email)
      .eq('is_active', true)
      .select('id')

    if (dbErr) {
      console.error('[unsubscribe] DB error:', dbErr)
      return NextResponse.json(
        { success: false, message: 'DB error', error: 'Failed to unsubscribe.' },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Not found', error: 'Subscription not found or already unsubscribed.' },
        { status: 404 }
      )
    }

    // ── Confirmation email (best effort) ────────────────────────────────

    try {
      await getResend().emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: "You've been unsubscribed",
        react: UnsubscribeEmail({ websiteUrl: BASE_URL }),
      })
    } catch (emailErr) {
      console.error('[unsubscribe] Email error:', emailErr)
    }

    return NextResponse.json({ success: true, message: 'Successfully unsubscribed.' })
  } catch (err) {
    console.error('[unsubscribe] Error:', err)
    return NextResponse.json(
      { success: false, message: 'Error', error: 'An error occurred.' },
      { status: 500 }
    )
  }
}
