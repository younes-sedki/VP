-- Migration: Add fileType and fileName columns for PDF/GIF support
-- Run this in your Supabase SQL editor if you haven't already

-- Add fileType and fileName columns to admin_tweets (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_tweets' AND column_name = 'fileType'
  ) THEN
    ALTER TABLE admin_tweets ADD COLUMN "fileType" TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_tweets' AND column_name = 'fileName'
  ) THEN
    ALTER TABLE admin_tweets ADD COLUMN "fileName" TEXT;
  END IF;
END $$;

-- Add fileType and fileName columns to user_tweets (if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_tweets' AND column_name = 'fileType'
  ) THEN
    ALTER TABLE user_tweets ADD COLUMN "fileType" TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_tweets' AND column_name = 'fileName'
  ) THEN
    ALTER TABLE user_tweets ADD COLUMN "fileName" TEXT;
  END IF;
END $$;

-- Verify the columns were added
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('admin_tweets', 'user_tweets')
  AND column_name IN ('fileType', 'fileName', 'likes')
ORDER BY table_name, column_name;
