# Supabase Setup Guide

Perfect! Since you already have Supabase, let's set it up for your tweet storage.

## Quick Setup Steps

### 1. Run the SQL Setup
Copy the contents of `supabase-setup.sql` and run it in your Supabase SQL editor:
1. Go to your Supabase dashboard
2. Click on "SQL Editor"
3. Paste the SQL code from `supabase-setup.sql`
4. Click "Run"

This will create:
- `admin_tweets` table
- `user_tweets` table  
- `admin_replies` table
- Proper indexes and security policies

### 2. Environment Variables
Make sure these are in your `.env.local` (already should be):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important**: Use the `service_role` key (not `anon` key) for server-side operations.

### 3. Deploy
```bash
npm run build
npm run start
# or deploy to Vercel/Netlify
```

## How It Works

### Development (Local)
- Uses local JSON files in `public/` directory
- No Supabase connection needed
- File system works normally

### Production (Online)
- Automatically detects Supabase environment variables
- Uses Supabase for all storage operations
- Data persists across deployments
- Proper database with indexes and security

## Features Now Working
- ✅ Admin login and authentication
- ✅ Creating admin tweets
- ✅ Creating user tweets  
- ✅ Deleting tweets (both admin and user)
- ✅ Editing tweets
- ✅ Comments and replies
- ✅ Admin replies to user tweets
- ✅ Likes and interactions

## Database Schema

### admin_tweets
- `id` (primary key)
- `author`, `handle`, `avatar`, `content`
- `image`, `created_at`, `updated_at`
- `likes`, `retweets`, `replies`
- `comments` (JSONB)

### user_tweets  
- Same structure as admin_tweets

### admin_replies
- `id` (primary key)
- `user_tweet_id` (references user_tweets.id)
- `comment_index`, `reply_id`
- `author`, `content`, `timestamp`

## Security
- Row Level Security (RLS) enabled
- Public read access for all users
- Service role write access for server operations
- Proper indexes for performance

## Benefits
- **Production-ready database storage**
- **No more file system issues**
- **Data persists across deployments**
- **Proper SQL database with indexes**
- **Secure with RLS policies**
- **Scales automatically with Supabase**

## Troubleshooting

### If Supabase connection fails:
1. Check environment variables are set correctly
2. Verify `SUPABASE_SERVICE_ROLE_KEY` (not anon key)
3. Check Supabase project URL
4. Ensure SQL setup was run successfully

### If data doesn't appear:
1. Check Supabase dashboard → Table Editor
2. Verify tables were created
3. Check browser console for errors
4. Test with local development first

### Migration from local files:
Your existing local tweets won't auto-migrate. You can:
1. Manually recreate important tweets
2. Create a migration script to upload local data to Supabase

## Environment Variables for Deployment
Make sure these are set in your hosting platform (Vercel/Netlify):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NODE_ENV=production
```

That's it! Your app will now work perfectly in production using Supabase as the database backend. 🎉
