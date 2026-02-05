-- Step 1: Create private schema and keys table for storing API tokens
CREATE SCHEMA IF NOT EXISTS private;

-- Create keys table to store sensitive API tokens
CREATE TABLE IF NOT EXISTS private.keys (
    key text PRIMARY KEY,
    value text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Insert MailerSend API token
-- IMPORTANT: Replace 'your_mailersend_api_token_here' with your actual MailerSend API token
INSERT INTO private.keys (key, value) 
VALUES ('MAILERSEND_API_TOKEN', 'mlsn.06ee1857a8b3c3832b2082f21552ea4d32876b98b55a9f10c39dc6a4ba52bc0a')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA private TO postgres;
GRANT ALL ON private.keys TO postgres;

-- Add comment
COMMENT ON TABLE private.keys IS 'Stores sensitive API keys and tokens for external services';
