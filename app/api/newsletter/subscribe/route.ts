import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getResend, EMAIL_FROM, EMAIL_REPLY_TO, BASE_URL } from '@/lib/resend'
import WelcomeEmail from '@/emails/welcome-email'
import type { SubscribeResponse } from '@/lib/types'

// ─── Supabase (service role — server only) ──────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── Simple rate limiter ────────────────────────────────────────────────────

const hits = new Map<string, { n: number; reset: number }>()
const LIMIT = 5
const WINDOW = 60_000

function rateOk(ip: string): boolean {
  const now = Date.now()
  const e = hits.get(ip)
  if (!e || now > e.reset) {
    hits.set(ip, { n: 1, reset: now + WINDOW })
    return true
  }
  return ++e.n <= LIMIT
}

// ─── POST /api/newsletter/subscribe ─────────────────────────────────────────

export async function POST(req: Request): Promise<NextResponse<SubscribeResponse>> {
  try {
    // Rate limit
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (!rateOk(ip)) {
      return NextResponse.json(
        { success: false, message: 'Too many requests', error: 'Please wait before trying again.' },
        { status: 429 }
      )
    }

    // Parse body
    const body = await req.json().catch(() => null)
    if (!body?.email || typeof body.email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid', error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const email = body.email.toLowerCase().trim()

    if (!emailRegex.test(email) || email.length > 320) {
      return NextResponse.json(
        { success: false, message: 'Invalid', error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    // ── Insert into Supabase ────────────────────────────────────────────

    const { data: subscriber, error: dbErr } = await supabase
      .from('newsletter_subscribers')
      .insert({ email, is_active: true })
      .select('id, email, unsubscribe_token')
      .single()

    if (dbErr) {
      if (dbErr.code === '23505' || dbErr.message?.includes('duplicate')) {
        return NextResponse.json(
          { success: false, message: 'Duplicate', error: 'This email is already subscribed.' },
          { status: 409 }
        )
      }
      console.error('[subscribe] DB error:', dbErr)
      return NextResponse.json(
        { success: false, message: 'DB error', error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      )
    }

    // ── Send welcome email via Resend ───────────────────────────────────

    const unsubscribeUrl = `${BASE_URL}/unsubscribe?token=${subscriber.unsubscribe_token}&email=${encodeURIComponent(email)}`

    try {
      const { data, error: emailErr } = await getResend().emails.send({
        from: EMAIL_FROM,
        to: email,
        replyTo: EMAIL_REPLY_TO,
        subject: 'Welcome to My Portfolio!',
        react: WelcomeEmail({
          websiteUrl: BASE_URL,
          fromName: process.env.EMAIL_FROM_NAME || 'Younes Sedki',
          unsubscribeUrl,
        }),
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
        },
      })

      if (emailErr) {
        console.error('[subscribe] Resend error:', emailErr)
      } else {
        console.log('[subscribe] Email sent:', data?.id)
      }
    } catch (emailErr) {
      console.error('[subscribe] Email exception:', emailErr)
      // Subscription still succeeded — don't fail
    }

    return NextResponse.json(
      { success: true, message: 'Successfully subscribed!' },
      { status: 201 }
    )
  } catch (err) {
    console.error('[subscribe] Error:', err)
    return NextResponse.json(
      { success: false, message: 'Error', error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
