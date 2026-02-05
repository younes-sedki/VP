-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  NEWSLETTER SYSTEM - SUPABASE SETUP (Resend Edition)                  ║
-- ║  Run this entire script in Supabase SQL Editor (one time)             ║
-- ║  Email sending is handled by Resend SDK in Next.js — not in DB       ║
-- ╚══════════════════════════════════════════════════════════════════════════╝


-- ═══════════════════════════════════════════════════════════════════════════
-- 1. EXTENSIONS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ═══════════════════════════════════════════════════════════════════════════
-- 2. NEWSLETTER SUBSCRIBERS TABLE
-- ═══════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS public.newsletter_subscribers CASCADE;

CREATE TABLE public.newsletter_subscribers (
  id                BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email             VARCHAR(320) NOT NULL,
  is_active         BOOLEAN DEFAULT TRUE NOT NULL,
  confirmed_at      TIMESTAMPTZ DEFAULT NULL,
  unsubscribe_token UUID DEFAULT gen_random_uuid() NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT subscribers_email_unique UNIQUE (email),
  CONSTRAINT subscribers_email_valid CHECK (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$')
);

-- Indexes
CREATE INDEX idx_subscribers_email   ON public.newsletter_subscribers (email);
CREATE INDEX idx_subscribers_active  ON public.newsletter_subscribers (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_subscribers_token   ON public.newsletter_subscribers (unsubscribe_token);
CREATE INDEX idx_subscribers_created ON public.newsletter_subscribers (created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_subscribers_updated_at
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Comments
COMMENT ON TABLE  public.newsletter_subscribers IS 'Newsletter subscriber emails';
COMMENT ON COLUMN public.newsletter_subscribers.unsubscribe_token IS 'UUID token for one-click unsubscribe';


-- ═══════════════════════════════════════════════════════════════════════════
-- 3. ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically
CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers FOR INSERT
  TO anon, authenticated WITH CHECK (TRUE);

CREATE POLICY "Read subscriptions"
  ON public.newsletter_subscribers FOR SELECT
  TO anon, authenticated USING (TRUE);

CREATE POLICY "Update subscriptions"
  ON public.newsletter_subscribers FOR UPDATE
  TO anon, authenticated USING (TRUE) WITH CHECK (TRUE);


-- ═══════════════════════════════════════════════════════════════════════════
-- 4. DONE
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  RAISE NOTICE '✅ Newsletter table created successfully';
  RAISE NOTICE '   Table: newsletter_subscribers';
  RAISE NOTICE '   Email sending: handled by Resend SDK in Next.js';
END;
$$;
