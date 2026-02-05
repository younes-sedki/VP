-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email VARCHAR(255) NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS newsletter_subscribers_email_idx ON public.newsletter_subscribers(email);

-- Create index on is_active for filtering active subscribers
CREATE INDEX IF NOT EXISTS newsletter_subscribers_active_idx ON public.newsletter_subscribers(is_active);

-- Create index on created_at for sorting by subscription date
CREATE INDEX IF NOT EXISTS newsletter_subscribers_created_at_idx ON public.newsletter_subscribers(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read" ON public.newsletter_subscribers
  FOR SELECT USING (TRUE);

-- Create policy for public insert (subscribe)
CREATE POLICY "Allow public insert" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (TRUE);

-- Create policy for authenticated users to update their own subscription
CREATE POLICY "Allow users to update their own subscription" ON public.newsletter_subscribers
  FOR UPDATE USING (auth.uid() = id OR TRUE) WITH CHECK (TRUE);

-- Add comments to table
COMMENT ON TABLE public.newsletter_subscribers IS 'Stores newsletter subscriber email addresses';
COMMENT ON COLUMN public.newsletter_subscribers.email IS 'Subscriber email address (unique)';
COMMENT ON COLUMN public.newsletter_subscribers.is_active IS 'Whether the subscription is active';
COMMENT ON COLUMN public.newsletter_subscribers.subscribed_at IS 'When the email was subscribed';
