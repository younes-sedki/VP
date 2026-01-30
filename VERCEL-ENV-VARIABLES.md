# Vercel Environment Variables - Quick Setup

## Required Variables for Your Project

Add these **three variables** to your Vercel project:

### 1. NEXT_PUBLIC_SUPABASE_URL
```
https://jmxxtixzdvhywzlhpzrg.supabase.co
```
- **Environment**: Production, Preview, Development
- **Purpose**: Your Supabase project URL

### 2. SUPABASE_SERVICE_ROLE_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteHh0aXh6ZHZoeXd6bGhwenJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc4MjY4NiwiZXhwIjoyMDg1MzU4Njg2fQ.VFGLw8KKjy_waJKfphSW5MvHahKLl60silZwpiOxM4E
```
- **Environment**: Production, Preview, Development
- **Purpose**: Service role key for server-side operations (write access)

### 3. ADMIN_SESSION_SECRET
```
npe6t4etwctaenjd
```
- **Environment**: Production, Preview, Development
- **Purpose**: Secret key for admin session authentication (required for admin login)

## Optional (Recommended)

### 4. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpteHh0aXh6ZHZoeXd6bGhwenJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3ODI2ODYsImV4cCI6MjA4NTM1ODY4Nn0.73xm_oXiuKUfk3LQu-yRpRGWWNmTkJaKHIzYZfoqDwk
```
- **Environment**: Production, Preview, Development
- **Purpose**: Anon key for client-side operations

## How to Add in Vercel

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. For each variable:
   - Enter the **Name** (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - Enter the **Value** (copy from above)
   - Select **Production**, **Preview**, and **Development**
   - Click **Save**
5. **Redeploy** your project after adding variables

## After Setup

Once you've added the variables and redeployed:
- ✅ "Storage not configured" error will disappear
- ✅ "Missing ADMIN_SESSION_SECRET" error will disappear
- ✅ Your app will connect to Supabase
- ✅ Admin login will work properly
- ✅ Tweets will be stored in Supabase database

## Next Step: Run SQL Setup

Don't forget to run the SQL setup script in Supabase:
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase-setup.sql`
3. Paste and run in SQL Editor

This creates the required tables: `admin_tweets`, `user_tweets`, `admin_replies`
