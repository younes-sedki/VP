import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('Missing required Supabase environment variables')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Insert email into Supabase
    const { data: insertData, error: supabaseError } = await supabase
      .from('newsletter_subscribers')
      .insert([
        {
          email: normalizedEmail,
          is_active: true,
        },
      ])
      .select()

    if (supabaseError) {
      console.error('Supabase insert error:', supabaseError)
      
      // Postgres unique violation
      if (supabaseError.code === '23505' || supabaseError.message?.includes('duplicate')) {
        return NextResponse.json(
          { error: 'This email is already subscribed' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      )
    }

    if (!insertData || insertData.length === 0) {
      console.error('Insert returned no rows')
      return NextResponse.json(
        { error: 'Subscription failed — no data returned' },
        { status: 500 }
      )
    }

    // Send welcome email
    try {
      const emailFrom = process.env.EMAIL_FROM || 'no-reply@sedkiy.dev'
      const emailFromName = process.env.EMAIL_FROM_NAME || 'Sedkiy'
      const websiteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sedkiy.dev'

      // Plain text version - CRITICAL for Outlook
      const textBody = `Welcome to My Portfolio!

Hi there,

Thanks for subscribing! I'm thrilled to have you part of my developer community.

What You'll Receive:
✓ Weekly project progress reports and milestones
✓ Behind-the-scenes development insights
✓ New tools and techniques I'm exploring
✓ Early previews of work-in-progress projects
✓ Industry observations and reflections
✓ Wins, lessons, and growth stories

Connect With Me:
GitHub: https://github.com/younes-sedki
LinkedIn: https://linkedin.com/in/younes-sedki

Looking forward to sharing my journey with you!

Best regards,
${emailFromName}

---
You're receiving this because you subscribed at ${websiteUrl}
Unsubscribe: ${websiteUrl}/unsubscribe?email=${encodeURIComponent(normalizedEmail)}`

      // HTML version - dark theme matching website
      const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to My Newsletter</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; background-color: #0a0a0a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" style="max-width: 600px; border-collapse: collapse; background-color: #0f0f0f; border: 1px solid rgba(255, 255, 255, 0.08);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <h1 style="color: #f5f5f5; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Welcome to My Portfolio! 🚀</h1>
              <p style="color: #b0b0b0; margin: 12px 0 0 0; font-size: 14px;">Thanks for joining my community</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #e0e0e0; line-height: 1.65; margin: 0 0 24px 0; font-size: 15px;">Hi there,</p>
              
              <p style="color: #d0d0d0; line-height: 1.65; margin: 0 0 24px 0; font-size: 15px;">I'm excited to have you here! You've joined a community of developers and tech enthusiasts who follow my journey.</p>
              
              <h2 style="color: #f5f5f5; font-size: 16px; font-weight: 600; margin: 32px 0 16px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 12px;">What You'll Receive</h2>
              
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 10px 0; color: #d0d0d0; font-size: 14px; line-height: 1.5;">✓ Weekly project progress reports and milestones</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #d0d0d0; font-size: 14px; line-height: 1.5;">✓ Behind-the-scenes development insights</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #d0d0d0; font-size: 14px; line-height: 1.5;">✓ New tools and techniques I'm exploring</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #d0d0d0; font-size: 14px; line-height: 1.5;">✓ Early previews of work-in-progress projects</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #d0d0d0; font-size: 14px; line-height: 1.5;">✓ Industry observations and reflections</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #d0d0d0; font-size: 14px; line-height: 1.5;">✓ Wins, lessons, and growth stories</td>
                </tr>
              </table>

              <h2 style="color: #f5f5f5; font-size: 16px; font-weight: 600; margin: 32px 0 16px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 12px;">Connect With Me</h2>
              
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin: 20px 0 32px 0;">
                <tr>
                  <td style="padding: 8px 0;">
                    <a href="https://twitter.com/younes_sedki" style="color: #5b9cf5; text-decoration: none; font-size: 14px;">𝕏 Twitter</a>
                    <span style="color: #606060; margin: 0 12px;">•</span>
                    <a href="https://github.com/younes-sedki" style="color: #5b9cf5; text-decoration: none; font-size: 14px;">GitHub</a>
                    <span style="color: #606060; margin: 0 12px;">•</span>
                    <a href="https://linkedin.com/in/younes-sedki" style="color: #5b9cf5; text-decoration: none; font-size: 14px;">LinkedIn</a>
                  </td>
                </tr>
              </table>

              <p style="color: #b0b0b0; line-height: 1.65; margin: 0; font-size: 14px;">Looking forward to sharing my journey with you!</p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 20px 40px; text-align: center;">
              <a href="${websiteUrl}" style="display: inline-block; padding: 12px 32px; background-color: #f5f5f5; color: #0a0a0a; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; letter-spacing: 0.3px;">Explore My Portfolio</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(255, 255, 255, 0.08); color: #808080; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 12px 0;">You're receiving this email because you subscribed to my newsletter.</p>
              <p style="margin: 0;">Want to unsubscribe? <a href="${websiteUrl}/unsubscribe?email=${encodeURIComponent(normalizedEmail)}" style="color: #a0a0a0; text-decoration: underline;">Click here</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

      const { data: emailResult, error: emailError } = await supabase.rpc(
        'send_email_message',
        {
          message: {
            sender: emailFrom,
            sender_name: emailFromName,
            recipient: normalizedEmail,
            subject: 'Welcome to My Portfolio!',
            html_body: htmlBody,
            text_body: textBody,
          },
        }
      )

      if (emailError) {
        console.error('Email sending failed:', emailError)
        // Don't fail the request - subscription still succeeded
        return NextResponse.json(
          {
            success: true,
            message: 'Subscribed but email sending failed',
            emailError: emailError.message || emailError,
            inserted: insertData,
          },
          { status: 200 }
        )
      }
      
      console.log('Email sent successfully:', emailResult)
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // Continue - subscription succeeded
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Successfully subscribed!', 
        inserted: insertData 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}