# Vercel Environment Variables - Quick Setup

## Required Variables for Your Project

Add these **four variables** to your Vercel project:

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

### 4. ADMIN_PASSWORD
```
your_admin_password_here
```
- **Environment**: Production, Preview, Development
- **Purpose**: Password for admin login (this is the password you'll use to log in)
- **Note**: Set this to whatever password you want to use for admin access. The default fallback is `younes123` but you should set your own secure password.

## Optional (Recommended)

### 5. NEXT_PUBLIC_SUPABASE_ANON_KEY
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
- ✅ Admin login will work properly (use the password you set in `ADMIN_PASSWORD`)
- ✅ Tweets will be stored in Supabase database

## Important: Admin Password

**You MUST add `ADMIN_PASSWORD` to Vercel environment variables!**

- The code looks for `process.env.ADMIN_PASSWORD`
- If not set, it defaults to `younes123` (but this may not work in production)
- **Set your own secure password** in the `ADMIN_PASSWORD` environment variable
- This is the password you'll use when logging into the admin panel
- After adding it, **redeploy** your project for it to take effect

## Next Step: Run SQL Setup

Don't forget to run the SQL setup script in Supabase:
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase-setup.sql`
3. Paste and run in SQL Editor

This creates the required tables: `admin_tweets`, `user_tweets`, `admin_replies`
