# How to Manually Trigger Vercel Rebuild

If automatic rebuilds aren't working, here's how to manually trigger one:

## Method 1: Vercel Dashboard (Easiest)

1. Go to: https://vercel.com/dashboard
2. Click on your project
3. Go to the **"Deployments"** tab
4. Find the latest deployment
5. Click the **"..."** (three dots) menu on the right
6. Click **"Redeploy"**
7. Confirm the redeploy

## Method 2: Vercel CLI

If you have Vercel CLI installed:

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login (if not logged in)
vercel login

# Redeploy to production
vercel --prod
```

## Method 3: Empty Commit (Git)

Make an empty commit to trigger rebuild:

```bash
git commit --allow-empty -m "Trigger rebuild"
git push
```

## After Rebuild

1. Wait for deployment to complete (usually 1-2 minutes)
2. Check deployment status in Vercel dashboard
3. Test your API: `https://www.sedkiy.dev/api/tweets`
4. Check function logs if there are still errors
