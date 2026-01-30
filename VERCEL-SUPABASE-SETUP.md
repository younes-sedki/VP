# Supabase Environment Variables Setup for Vercel

## Quick Setup Guide

Your application needs Supabase environment variables configured in Vercel to work in production.

### Step 1: Get Your Supabase Credentials

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Get Your Project URL**
   - Go to **Settings** → **API**
   - Copy the **Project URL** (looks like: `https://xxxxx.supabase.co`)

3. **Get Your Service Role Key**
   - In the same **Settings** → **API** page
   - Find **Service Role** key (under "Project API keys")
   - Click **Reveal** and copy the key
   - ⚠️ **Important**: Use the **Service Role** key (not the `anon` key)

### Step 2: Add Environment Variables to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Navigate to Settings**
   - Click on your project
   - Go to **Settings** tab
   - Click **Environment Variables** in the left sidebar

3. **Add the Required Variables**

   Add these **two required variables**:

   | Variable Name | Value | Environment |
   |--------------|-------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | Production, Preview, Development |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Role Key | Production, Preview, Development |

   **Alternative variable names** (your code supports both):
   - `TWEET_SUPABASE_URL` (instead of `NEXT_PUBLIC_SUPABASE_URL`)
   - `TWEET_SUPABASE_SERVICE_ROLE_KEY` (instead of `SUPABASE_SERVICE_ROLE_KEY`)

   **Optional** (for client-side operations):
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase Anon key (from Settings → API)

4. **Save and Redeploy**
   - Click **Save** after adding each variable
   - Go to **Deployments** tab
   - Click the **"..."** menu on the latest deployment
   - Click **Redeploy** (or push a new commit to trigger auto-deploy)

### Step 3: Verify Setup

After redeployment:

1. **Check Build Logs**
   - Look for: `Supabase client initialized successfully`
   - Should NOT see: `Supabase not available` warnings

2. **Test Your Application**
   - Visit your deployed site
   - Try creating a tweet
   - Should work without "Storage not configured" errors

3. **Check Supabase Tables**
   - Go to Supabase Dashboard → **Table Editor**
   - You should see: `admin_tweets`, `user_tweets`, `admin_replies`
   - If tables don't exist, run `supabase-setup.sql` in Supabase SQL Editor

## Troubleshooting

### Error: "Storage not configured"
- ✅ Verify both environment variables are set in Vercel
- ✅ Make sure you used **Service Role Key** (not anon key)
- ✅ Check that variables are set for **Production** environment
- ✅ Redeploy after adding variables

### Error: "Supabase client not initialized"
- ✅ Check Vercel build logs for specific error messages
- ✅ Verify the Supabase URL is correct (should start with `https://`)
- ✅ Verify the Service Role Key is correct (long string, starts with `eyJ...`)

### Tables Don't Exist
- Run the SQL setup script: `supabase-setup.sql` in Supabase SQL Editor
- See `SUPABASE-SETUP.md` for detailed instructions

## Environment Variables Summary

**Required for Production:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

**Optional:**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - For client-side Supabase operations

**Note:** Your code supports both prefixed (`TWEET_`) and non-prefixed variable names, so either naming convention will work.
