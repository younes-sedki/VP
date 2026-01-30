# Setup Instructions - Supabase via Vercel Marketplace

## ✅ Step 1: Code Updated
Your code has been updated to use the `TWEET_` prefixed environment variables that Vercel Marketplace created.

## ✅ Step 2: Run SQL Setup Script

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `ygsosxenjzvhkjlhnjfb`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Setup Script**
   - Copy the entire contents of `supabase-setup.sql`
   - Paste it into the SQL Editor
   - Click "Run" (or press Ctrl+Enter)

4. **Verify Tables Were Created**
   - Go to "Table Editor" in the left sidebar
   - You should see three tables:
     - `admin_tweets`
     - `user_tweets`
     - `admin_replies`

## ✅ Step 3: Redeploy Your Vercel Project

After running the SQL script, redeploy your Vercel project:

1. **Option A: Automatic Redeploy**
   - Push any code changes to your Git repository
   - Vercel will automatically redeploy

2. **Option B: Manual Redeploy**
   - Go to Vercel Dashboard → Your Project
   - Click "Deployments" tab
   - Click the "..." menu on the latest deployment
   - Click "Redeploy"

## ✅ Step 4: Test Your Application

After redeployment:

1. **Test Fetching Tweets**
   - Visit your website
   - Check if tweets load (should be empty initially)

2. **Test Posting a Tweet**
   - Try creating a new tweet
   - It should save successfully

3. **Check for Errors**
   - Open browser console (F12)
   - Look for any error messages
   - Check Vercel function logs if issues occur

## Environment Variables (Already Set ✅)

These are automatically set by Vercel Marketplace:
- `TWEET_SUPABASE_URL` ✅
- `TWEET_SUPABASE_SERVICE_ROLE_KEY` ✅
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅

## Troubleshooting

### If tweets don't load:
1. Check browser console for errors
2. Verify SQL script ran successfully
3. Check Supabase Table Editor - tables should exist
4. Check Vercel function logs for API errors

### If posting tweets fails:
1. Verify `TWEET_SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
2. Check Supabase RLS policies are correct
3. Check Vercel function logs for detailed errors

### If you see "Storage not configured" error:
- Verify environment variables are set in Vercel
- Make sure you redeployed after adding Supabase integration

## Next Steps

Once everything is working:
- ✅ Tweets will persist across deployments
- ✅ Data is stored in Supabase database
- ✅ No more file system issues
- ✅ Your app is production-ready!

🎉 **You're all set!** Your tweets should now work perfectly in production.
