-- Supabase SQL setup for tweet storage
-- Run this in your Supabase SQL editor

-- Create admin_tweets table
CREATE TABLE IF NOT EXISTS admin_tweets (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  handle TEXT NOT NULL,
  avatar TEXT NOT NULL,
  avatar_image TEXT,
  content TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ,
  likes INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  comments JSONB DEFAULT '[]'::jsonb
);

-- Create user_tweets table
CREATE TABLE IF NOT EXISTS user_tweets (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL,
  handle TEXT NOT NULL,
  avatar TEXT NOT NULL,
  avatar_image TEXT,
  content TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ,
  likes INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  comments JSONB DEFAULT '[]'::jsonb
);

-- Create admin_replies table
CREATE TABLE IF NOT EXISTS admin_replies (
  id TEXT PRIMARY KEY,
  user_tweet_id TEXT NOT NULL,
  comment_index INTEGER,
  reply_id TEXT,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_tweets_created_at ON admin_tweets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_tweets_created_at ON user_tweets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_replies_user_tweet_id ON admin_replies(user_tweet_id);

-- Enable Row Level Security (RLS)
ALTER TABLE admin_tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_replies ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (read-only for users, write for service role)
-- Admin tweets - public read, service role write
CREATE POLICY "Public read access for admin tweets" ON admin_tweets
  FOR SELECT USING (true);

CREATE POLICY "Service role full access for admin tweets" ON admin_tweets
  FOR ALL USING (auth.role() = 'service_role');

-- User tweets - public read, service role write
CREATE POLICY "Public read access for user tweets" ON user_tweets
  FOR SELECT USING (true);

CREATE POLICY "Service role full access for user tweets" ON user_tweets
  FOR ALL USING (auth.role() = 'service_role');

-- Admin replies - public read, service role write
CREATE POLICY "Public read access for admin replies" ON admin_replies
  FOR SELECT USING (true);

CREATE POLICY "Service role full access for admin replies" ON admin_replies
  FOR ALL USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT ALL ON admin_tweets TO service_role;
GRANT ALL ON user_tweets TO service_role;
GRANT ALL ON admin_replies TO service_role;

-- Grant read access to anonymous users
GRANT SELECT ON admin_tweets TO anon;
GRANT SELECT ON user_tweets TO anon;
GRANT SELECT ON admin_replies TO anon;

-- Grant read access to authenticated users
GRANT SELECT ON admin_tweets TO authenticated;
GRANT SELECT ON user_tweets TO authenticated;
GRANT SELECT ON admin_replies TO authenticated;
