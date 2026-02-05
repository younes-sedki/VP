-- Step 3: Create messages table for tracking email messages (optional)
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender text NOT NULL,
    recipient text NOT NULL,
    subject text NOT NULL,
    html_body text,
    text_body text,
    status text DEFAULT 'ready' CHECK (status IN ('ready', 'sent', 'failed')),
    created_at timestamp with time zone DEFAULT now(),
    sent_at timestamp with time zone,
    provider_response jsonb,
    metadata jsonb
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS messages_status_idx ON public.messages(status);
CREATE INDEX IF NOT EXISTS messages_recipient_idx ON public.messages(recipient);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS messages_sent_at_idx ON public.messages(sent_at DESC);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy for service role (full access)
CREATE POLICY "Service role has full access to messages"
    ON public.messages
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policy for authenticated users (read only)
CREATE POLICY "Authenticated users can read messages"
    ON public.messages
    FOR SELECT
    TO authenticated
    USING (true);

-- Add comments
COMMENT ON TABLE public.messages IS 'Stores email messages and their delivery status';
COMMENT ON COLUMN public.messages.status IS 'Message status: ready (not sent), sent (successfully sent), failed (send failed)';
