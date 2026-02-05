# Newsletter Email Setup Guide

This guide shows you how to set up automated welcome emails for newsletter subscribers using **MailerSend**.

## Why MailerSend?

- ✅ Professional email delivery service
- ✅ Generous free tier (12,000 emails/month)
- ✅ Advanced analytics and tracking
- ✅ Email templates and drag-and-drop editor
- ✅ Great deliverability rates
- ✅ Works seamlessly with Supabase

## Setup Steps

### 1. Create a MailerSend Account

1. Go to [mailersend.com](https://www.mailersend.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Add and Verify Your Domain

1. In the MailerSend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records to your domain provider:
   - SPF record
   - DKIM record
   - CNAME records
5. Wait for verification (usually takes a few minutes to a few hours)
6. Once verified, you can send from `newsletter@yourdomain.com`

**Note**: You must verify a domain to send emails with MailerSend. There's no temporary test domain like some other services.

### 3. Get Your API Key

1. In the MailerSend dashboard, go to **Settings** → **API Tokens**
2. Click **Generate New Token**
3. Give it a name (e.g., "Newsletter Welcome Emails")
4. Select scopes: **Email** → **Full access**
5. Click **Create**
6. Copy the API token (you won't be able to see it again!)

### 4. Add Environment Variables

Add these to your `.env.local` file:

```env
# MailerSend API Token
MAILERSEND_API_KEY=your_mailersend_api_token_here

# Email sender address (must be on verified domain)
EMAIL_FROM=newsletter@yourdomain.com
EMAIL_FROM_NAME=YOUNES SEDKI

# Your website URL (for links in emails)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
# Or for local testing: http://localhost:3000
```

### 5. Restart Your Dev Server

```bash
pnpm dev
```

### 6. Test the Newsletter

1. Go to your website
2. Scroll to the newsletter section
3. Subscribe with your email
4. Check your inbox for the welcome email! 📧

## Email Template Customization

The welcome email template is in [app/api/newsletter/subscribe/route.ts](app/api/newsletter/subscribe/route.ts).

You can customize:
- **Subject line**: Change `'Welcome to My Newsletter! 🎉'`
- **Content**: Modify the HTML in the `html` property
- **Styling**: Update the inline CSS styles
- **Features list**: Add/remove bullet points
- **CTA button**: Change the link and text

### Example Customizations:

```typescript
// Custom subject
subject: 'Thanks for Subscribing! 🚀',

// Custom greeting
<h1>Hey there! 👋</h1>

// Add your name
<p>I'm Younes, and I'm excited to share my work with you!</p>

// Change button text
<a href="...">Read My Latest Post</a>
```

## Email Features

### Current Template Includes:

- ✅ Professional dark-themed design (matches your website)
- ✅ Mobile-responsive layout
- ✅ Feature list of what subscribers get
- ✅ Call-to-action button
- ✅ Unsubscribe link (required by law)
- ✅ Optimized for email clients (Gmail, Outlook, etc.)

### Email Content:

1. **Welcome message**
2. **What to expect** (4 bullet points):
   - Weekly project updates
   - Behind-the-scenes insights
   - New tools and techniques
   - Work-in-progress previews
3. **Visit website button**
4. **Unsubscribe link**

## Testing Tips

### Test Locally:
```bash
# Start dev server
pnpm dev

# Subscribe at http://localhost:3000
# Check email arrives in your inbox
```

### Check Resend Logs:
1. Go to Resend dashboard
2. Click **Logs** or **Emails**
3. See delivery status, opens, clicks

### Test Different Emails:
- Gmail
- Outlook
- Yahoo Mail
- Mobile email apps

### Check Email Rendering:
1. Use [Litmus](https://www.litmus.com/) or [Email on Acid](https://www.emailonacid.com/)
2. Test in multiple email clients
3. Check mobile responsiveness

## Troubleshooting

### EmMAILERSEND_API_KEY
echo $EMAIL_FROM
```

**Check server logs:**
- Look for errors in terminal
- Check `console.error` messages

**Verify API token:**
- Ensure it's active in MailerSend dashboard
- Check token permissions (needs Email → Full access)
- Make sure it hasn't expired

**Verify domain:**
- Domain must be verified in MailerSend
- Check DNS records are properly set
- Wait for verification to complete
- Check `console.error` messages

**Verify API key:**- MailerSend requires domain verification
2. **Check SPF/DKIM records** - Ensure they're properly configured
3. **Use proper DNS setup** - MailerSend provides all necessary records
4. **Warm up your domain** - Start with low volume, gradually increase
5. **Monitor bounce rates** - Check MailerSend analytics
6. **Test with different providers** - Gmail, Outlook, etc.

### Email not arriving?

1. **Check spam/junk folder**
2. **Verify sender email domain** is verified in MailerSend
3. **Check MailerSend activity log** for delivery errors
4. **Verify DNS records** are correctly set
5. **Try different recipient email**
6. **Check domain reputation** in MailerSend dashboard

### Rate limits?

Free tier: 12,000 emails/month
- Monitor your usage in MailerSend dashboard
- Upgrade plan if needed
- Check activity log for throttling
### Resend
```typescript
// Install
pnpm add resend

// Use in API route
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
await resend.emails.send({ ... })
```

### Email not arriving?

1. **Check spam/junk folder**
2. **Verify sender email** is approved in Resend
3. **Check Resend logs** for delivery errors
4. **Try different recipient email**

## Alternative Email Services

If you prefer a different service:

### SendGrid
```typescript
// Install
pnpm add @sendgrid/mail

// Use in API route
import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
await sgMail.send({ ... })
```

### Mailgun
```typescript
// InstallMailerSend
- [ ] DNS records (SPF, DKIM, CNAME) properly configured
- [ ] `MAILERSEND_API_KEY` set in production environment
- [ ] `EMAIL_FROM` using verified domain email
- [ ] `EMAIL_FROM_NAME` set appropriately
- [ ] `NEXT_PUBLIC_BASE_URL` set to production URL
- [ ] Test subscription flow works
- [ ] Welcome email arrives correctly
- [ ] Email displays well in Gmail, Outlook, mobile
- [ ] Unsubscribe link works
- [ ] Monitor MailerSend activity log
- [ ] Set up email suppression lists if needed
```typescript
// Install
pnpm add nodemailer

// Use with Gmail, Outlook, etc.
import nodemailer from 'nodemailer'
const transporter = nodemailer.createTransport({ ... })
```

## Production Checklist

Before deploying to production:

- [ ] Domain verified in Resend
- [ ] `RESEND_API_KEY` set in production environment
- [ ] `EMAIL_FROM` using verified domain email
- [ ] `NEXT_PUBLIC_BASE_URL` set to production URL
- [ ] Test subscription flow works
- [ ] Welcome email arrives correctly
- [ ] Unsubscribe link works
- [ ] Email displays well on mobile
- [ ] Tested in multiple email clients

## Legal Requirements

**Include in every email:**
- ✅ Unsubscribe link (already included)
- ✅ Physical address (optional but recommended)
- ✅ Clear sender identification

**Comply with:**
- CAN-SPAM Act (US)
- GDPR (EU)
- CASL (Canada)

##Bounce rates
- Most popular links
- Geographic distribution
- Device types (desktop vs mobile)

### Use MailerSend Features:
- Email templates builder
- A/B testing
- Scheduled sending
- Webhooks for events
- Email validation API
- Suppression lists

## Resources

- [MailerSend Documentation](https://developers.mailersend.com/)
- [MailerSend API Reference](https://developers.mailersend.com/api/v1/email.html)
- [Email Best Practices](https://www.mailersend.com/blog)
- [Email HTML Guide](https://www.campaignmonitor.com/dev-resources/guides/coding/)
- [Can I Email](https://www.caniemail.com/) - CSS support in email clients

## Support

If you need help:
- Check [MailerSend documentation](https://developers.mailersend.com/)
- Visit [MailerSend Help Center](https://www.mailersend.com/help)
- Contact MailerSend support via dashboard
- Join MailerSend community forums

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Email Best Practices](https://resend.com/docs/best-practices)
- [Email HTML Guide](https://www.campaignmonitor.com/dev-resources/guides/coding/)
- [Can I Email](https://www.caniemail.com/) - CSS support in email clients

## Support

If you need help:
- Check Resend documentation
- Visit Resend Discord community
- Email Resend support (very responsive!)

---

**🎉 Your newsletter now has automated welcome emails! 🎉**
