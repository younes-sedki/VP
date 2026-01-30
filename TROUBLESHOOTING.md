# Troubleshooting Guide

## If you're still getting errors after setup:

### 1. Check Vercel Function Logs
1. Go to Vercel Dashboard → Your Project
2. Click "Functions" tab
3. Look for errors in `/api/tweets` function
4. Check for Supabase connection errors

### 2. Verify Environment Variables
In Vercel Dashboard → Settings → Environment Variables, make sure you have:
- ✅ `TWEET_SUPABASE_URL`
- ✅ `TWEET_SUPABASE_SERVICE_ROLE_KEY`

### 3. Verify Tables Exist in Supabase
1. Go to Supabase Dashboard → Table Editor
2. You should see:
   - `admin_tweets`
   - `user_tweets`
   - `admin_replies`
3. If tables don't exist, run the SQL script again

### 4. Check RLS Policies
1. Go to Supabase Dashboard → Authentication → Policies
2. Verify policies exist for all three tables
3. Make sure service_role has full access

### 5. Test Supabase Connection
Run this in Supabase SQL Editor to test:
```sql
SELECT * FROM admin_tweets LIMIT 1;
SELECT * FROM user_tweets LIMIT 1;
SELECT * FROM admin_replies LIMIT 1;
```

### 6. Common Error Messages

**"Storage not configured"**
- Environment variables not set in Vercel
- Redeploy after adding variables

**"Failed to save to Supabase"**
- Check Supabase function logs
- Verify service role key is correct
- Check RLS policies allow writes

**"relation does not exist"**
- Tables not created
- Run SQL setup script again

**"permission denied"**
- RLS policies blocking access
- Check service role permissions

### 7. Debug Steps

1. **Check if Supabase is detected:**
   - Look for "Supabase client not initialized" in logs
   - This means environment variables aren't being read

2. **Check column names:**
   - Supabase returns exact column names from database
   - Make sure SQL script used quoted identifiers correctly

3. **Test with a simple insert:**
   ```sql
   INSERT INTO user_tweets (id, author, handle, avatar, content, "created_at")
   VALUES ('test-123', 'Test', 'testuser', 'user', 'Test tweet', NOW());
   ```

### 8. Still Not Working?

Share these details:
- Error message from browser console
- Error from Vercel function logs
- Screenshot of Supabase Table Editor
- Environment variables (hide sensitive values)
