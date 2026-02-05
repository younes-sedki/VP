# Newsletter Supabase Setup

## Overview
The newsletter feature stores subscriber emails in Supabase and sends automated welcome emails via MailerSend.

## Quick Start

### 1. Database Setup (Required)
Run the SQL migration to create the newsletter table:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `supabase-migration-newsletter.sql`
5. Paste it into the SQL editor
6. Click **Run**

### 2. Email Setup (Optional)
To send welcome emails, set up MailerSend:

See **[EMAIL-SETUP.md](./EMAIL-SETUP.md)** for detailed instructions.

**Quick setup:**
1. Sign up at [mailersend.com](https://www.mailersend.com/)
2. Verify your domain
3. Get your API token
4. Add to `.env.local`:
   ```env
   MAILERSEND_API_KEY=your_api_token
   EMAIL_FROM=newsletter@yourdomain.com
   EMAIL_FROM_NAME=YOUNES SEDKI
   ```

## Setup Steps

### 1. Run the SQL Migration
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `supabase-migration-newsletter.sql`
5. Paste it into the SQL editor
6. Click **Run**

This will create:
- `newsletter_subscribers` table with email storage
- Indexes for performance
- Row Level Security (RLS) policies
- Automatic timestamps

### 2. Verify Environment Variables
**Required** - Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Optional** - For welcome emails:

```env
MAILERSEND_API_KEY=your_mailersend_api_token
EMAIL_FROM=newsletter@yourdomain.com
EMAIL_FROM_NAME=YOUNES SEDKI
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

Both Supabase keys are available in your Supabase project settings.

### 3. Test the Newsletter
1. Start your dev server: `pnpm dev`
2. Navigate to your website
3. Scroll to the "Weekly Newsletter" section
4. Test subscribing with an email address
5. Check Supabase > Table Editor > `newsletter_subscribers` to verify the email was saved
6. Check your inbox for the welcome email (if email is configured)

## Features

✅ **Email Validation** - Checks for valid email format  
✅ **Duplicate Prevention** - Prevents the same email from subscribing twice  
✅ **Error Handling** - Displays user-friendly error messages  
✅ **Welcome Emails** - Automated welcome email sent on subscription (optional)  
✅ **Automatic Timestamps** - Records subscription and update times  
✅ **Activation Status** - `is_active` flag for managing subscriptions  
✅ **Indexed Queries** - Fast lookups with database indexes  

## Database Schema

```sql
CREATE TABLE newsletter_subscribers (
  id BIGINT PRIMARY KEY (auto-generated)
  email VARCHAR(255) NOT NULL UNIQUE
  subscribed_at TIMESTAMP (when subscribed)
  updated_at TIMESTAMP (last update)
  is_active BOOLEAN (true by default)
  created_at TIMESTAMP (record creation)
)
```

## API Reference

### Subscribe (Client-side)
```typescript
const { error } = await supabase
  .from("newsletter_subscribers")
  .insert([{ email: "user@example.com", is_active: true }])
```

### Query All Subscribers (Server-side with service role key)
```typescript
const { data, error } = await supabase
  .from("newsletter_subscribers")
  .select("*")
  .eq("is_active", true)
```

### Unsubscribe an Email
```typescript
const { error } = await supabase
  .from("newsletter_subscribers")
  .update({ is_active: false })
  .eq("email", "user@example.com")
```

## Next Steps

### Future Enhancements
- [ ] Email confirmation workflow
- [ ] Unsubscribe link functionality with confirmation
- [ ] Admin panel to view/manage subscribers
- [ ] Email sending integration (SendGrid, Resend, etc.)
- [ ] Analytics on subscriber growth
- [ ] Export subscribers as CSV

### To Add Email Sending:
We recommend using:
- **[Resend](https://resend.com)** - Modern email API
- **[SendGrid](https://sendgrid.com)** - Reliable email service
- **[Mailgun](https://mailgun.com)** - Flexible email platform

## Troubleshooting

### "Email already subscribed" error
- This email is already in the database
- User can unsubscribe first if they want, then resubscribe

### Emails not saving
1. Check environment variables are set
2. Verify SQL migration ran successfully
3. Check browser console for errors
4. Verify table exists: `SELECT * FROM newsletter_subscribers;` in SQL Editor

### Connection issues
1. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
2. Check Supabase project is active
3. Ensure RLS policies allow public insert

## Security Notes

✅ Unique constraint prevents duplicate emails  
✅ RLS policies restrict unauthorized access  
✅ Emails are stored securely in Supabase  
✅ No sensitive data beyond email is stored  
✅ Client-side validation before submission  

**Important**: Never expose your `SUPABASE_SERVICE_ROLE_KEY` in client-side code. Keep it server-side only.

## Support

For issues, check:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- Project error logs in Supabase dashboard
