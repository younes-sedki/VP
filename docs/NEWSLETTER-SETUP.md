# Newsletter System — Setup Guide (Resend)

## Architecture

```
User (form) → /api/newsletter/subscribe → Supabase DB (insert)
                                        → Resend SDK  (welcome email)
           ← JSON response

Unsubscribe link → /unsubscribe?token=xxx → /api/newsletter/unsubscribe
                                           → Supabase DB (deactivate)
                                           → Resend SDK  (confirmation email)
```

**Stack**: Next.js API Routes + Supabase (DB only) + Resend (email) + React Email (templates)

---

## Step 1: Supabase Database Setup

1. Open your Supabase project → **SQL Editor**
2. Paste the entire contents of [`sql/newsletter-setup.sql`](../sql/newsletter-setup.sql)
3. Click **Run**

### What gets created:

| Object | Type | Purpose |
|--------|------|---------|
| `newsletter_subscribers` | Table | Stores emails with unsubscribe tokens |
| `update_updated_at()` | Trigger fn | Auto-updates `updated_at` column |
| Indexes | B-tree | On `email`, `unsubscribe_token`, `is_active` |
| RLS Policies | Security | Prevents public read, allows service role |

> **Note**: No email functions in the database — email sending is handled entirely by the Resend SDK in your Next.js API routes.

---

## Step 2: Resend Configuration

### 2a. Create Account

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email address

### 2b. Domain Verification

1. Go to **Domains** → **Add Domain**
2. Enter `sedkiy.dev`
3. Add the DNS records Resend provides (SPF, DKIM, DMARC)
4. Wait for verification (usually < 5 minutes)

### 2c. API Key

1. Go to **API Keys** → **Create API Key**
2. Name: `sedkiy-newsletter`
3. Permission: **Sending access** (domain-level is fine)
4. Copy the key (starts with `re_`)

---

## Step 3: Environment Variables

Add to `.env.local`:

```env
# Resend
RESEND_API_KEY=re_your_api_key_here

# Email sender (must match verified domain)
EMAIL_FROM=no-reply@sedkiy.dev
EMAIL_FROM_NAME=Younes Sedki
EMAIL_REPLY_TO=younes@sedkiy.dev

# Base URL (for unsubscribe links)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

> **Production**: Change `NEXT_PUBLIC_BASE_URL` to `https://sedkiy.dev`

---

## Step 4: Test

### Quick Test (cURL)

```bash
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

### Expected Response

```json
{
  "success": true,
  "message": "You're subscribed! Check your inbox for a welcome email."
}
```

### Verify in Supabase

```sql
SELECT id, email, is_active, unsubscribe_token, created_at
FROM newsletter_subscribers
ORDER BY created_at DESC
LIMIT 5;
```

---

## File Structure

```
emails/
  welcome-email.tsx          # React Email welcome template
  unsubscribe-email.tsx      # React Email unsubscribe confirmation
lib/
  resend.ts                  # Resend client singleton + config
app/
  api/newsletter/
    subscribe/route.ts       # POST — subscribe + send welcome email
    unsubscribe/route.ts     # POST — unsubscribe + send confirmation
  unsubscribe/
    page.tsx                 # Client-side unsubscribe UI
components/
  newsletter-section.tsx     # Subscription form component
sql/
  newsletter-setup.sql       # Supabase database setup (run once)
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Missing RESEND_API_KEY` | Add to `.env.local` and restart dev server |
| `403 Forbidden` from Resend | Domain not verified — check Resend dashboard |
| `422 Validation error` | Check `EMAIL_FROM` matches a verified domain |
| Emails go to spam | Ensure SPF/DKIM/DMARC DNS records are set |
| Rate limited | Default: 5 requests per IP per 60 seconds |
| Duplicate email | Returns success message (no error) — idempotent |

---

## Security Features

- **Rate limiting**: 5 subscribe requests per IP per 60 seconds
- **Email validation**: Server-side regex + length check
- **RLS policies**: Subscribers table locked down at DB level
- **Unsubscribe tokens**: UUID v4, one per subscriber
- **List-Unsubscribe header**: Added to welcome emails (RFC 8058)
- **Service role only**: All DB access uses `SUPABASE_SERVICE_ROLE_KEY` (never exposed to client)
