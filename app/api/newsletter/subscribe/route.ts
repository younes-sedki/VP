import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Insert email into Supabase
    const { error: supabaseError } = await supabase
      .from('newsletter_subscribers')
      .insert([
        {
          email: normalizedEmail,
          is_active: true,
        },
      ])

    if (supabaseError) {
      if (supabaseError.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already subscribed' },
          { status: 409 }
        )
      }
      console.error('Supabase error:', supabaseError)
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      )
    }

    // Send welcome email using Supabase function
    try {
      const emailFrom = process.env.EMAIL_FROM || 'newsletter@yourdomain.com'
      const emailFromName = process.env.EMAIL_FROM_NAME || 'YOUNES SEDKI'
      const websiteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

      const htmlBody = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to My Newsletter</title>
  </head>
  <body style="margin: 0; padding: 0; font-family:  -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0a0a0a;">
      <tr>
        <td align="center" style="padding: 40px 20px;">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #171717; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden;">
            <tr>
              <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #171717 0%, #262626 100%);">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Welcome! 🎉</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 40px;">
                <p style="margin: 0 0 20px; color: rgba(255, 255, 255, 0.9); font-size: 16px; line-height: 1.6;">Hi there!</p>
                <p style="margin: 0 0 20px; color: rgba(255, 255, 255, 0.9); font-size: 16px; line-height: 1.6;">Thank you for subscribing to my newsletter. I'm excited to have you here!</p>
                <p style="margin: 0 0 20px; color: rgba(255, 255, 255, 0.7); font-size: 15px; line-height: 1.6;">Here's what you can expect in your inbox:</p>
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
                  <tr>
                    <td style="padding: 12px 0;">
                      <span style="color: #10b981; font-size: 16px; margin-right: 10px;">✓</span>
                      <span style="color: rgba(255, 255, 255, 0.8); font-size: 14px;">Weekly project updates and progress reports</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <span style="color: #10b981; font-size: 16px; margin-right: 10px;">✓</span>
                      <span style="color: rgba(255, 255, 255, 0.8); font-size: 14px;">Behind-the-scenes insights into my work</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <span style="color: #10b981; font-size: 16px; margin-right: 10px;">✓</span>
                      <span style="color: rgba(255, 255, 255, 0.8); font-size: 14px;">New tools, techniques, and industry insights</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <span style="color: #10b981; font-size: 16px; margin-right: 10px;">✓</span>
                      <span style="color: rgba(255, 255, 255, 0.8); font-size: 14px;">Exclusive previews of work-in-progress projects</span>
                    </td>
                  </tr>
                </table>
                <p style="margin: 25px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; line-height: 1.6;">I promise to keep things valuable and respect your inbox. No spam, ever.</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 20px 40px 40px;" align="center">
                <a href="${websiteUrl}" style="display: inline-block; padding: 14px 32px; background-color: #ffffff; color: #0a0a0a; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">Visit My Website</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 40px; border-top: 1px solid rgba(255, 255, 255, 0.1); background-color: #0a0a0a;">
                <p style="margin: 0 0 10px; color: rgba(255, 255, 255, 0.5); font-size: 13px; text-align: center;">You're receiving this email because you subscribed to my newsletter.</p>
                <p style="margin: 0; color: rgba(255, 255, 255, 0.4); font-size: 12px; text-align: center;">Want to unsubscribe? <a href="${websiteUrl}/unsubscribe?email=${encodeURIComponent(normalizedEmail)}" style="color: rgba(255, 255, 255, 0.6); text-decoration: underline;">Click here</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

      // Call Supabase send_email_message function
      const { data: emailResult, error: emailError } = await supabase.rpc(
        'send_email_message',
        {
          message: {
            sender: emailFrom,
            sender_name: emailFromName,
            recipient: normalizedEmail,
            subject: 'Welcome to My Newsletter! 🎉',
            html_body: htmlBody,
          },
        }
      )

      if (emailError) {
        console.error('Supabase email function error:', emailError)
      } else if (emailResult) {
        console.log('Email sent successfully:', emailResult)
      }
    } catch (emailError) {
      // Log but don't fail the subscription if email fails
      console.error('Email sending error:', emailError)
    }

    return NextResponse.json(
      { success: true, message: 'Successfully subscribed!' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
