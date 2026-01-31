-- Migration: Add admin likes tracking
-- Run this in your Supabase SQL editor

-- Add likedByAdmin column to track if admin liked a user tweet
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_tweets' AND column_name = 'likedByAdmin'
  ) THEN
    ALTER TABLE user_tweets ADD COLUMN "likedByAdmin" BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_tweets_liked_by_admin ON user_tweets("likedByAdmin") WHERE "likedByAdmin" = true;

-- Verify the column was added
SELECT 
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_tweets'
  AND column_name = 'likedByAdmin';
