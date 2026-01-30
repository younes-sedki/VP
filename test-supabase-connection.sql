-- Test Supabase Connection
-- Run this in Supabase SQL Editor to verify everything is set up correctly

-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('admin_tweets', 'user_tweets', 'admin_replies');

-- 2. Check table structures
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_tweets' 
ORDER BY ordinal_position;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_tweets' 
ORDER BY ordinal_position;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_replies' 
ORDER BY ordinal_position;

-- 3. Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('admin_tweets', 'user_tweets', 'admin_replies');

-- 4. Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('admin_tweets', 'user_tweets', 'admin_replies');

-- 5. Test insert (should work with service role)
INSERT INTO user_tweets (id, author, handle, avatar, content, "created_at")
VALUES ('test-' || extract(epoch from now()), 'Test User', 'testuser', 'user', 'Test tweet from SQL', NOW())
ON CONFLICT (id) DO NOTHING;

-- 6. Test select
SELECT * FROM user_tweets WHERE id LIKE 'test-%' ORDER BY "created_at" DESC LIMIT 5;

-- 7. Clean up test data (optional)
-- DELETE FROM user_tweets WHERE id LIKE 'test-%';
