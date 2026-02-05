-- Enable the HTTP extension for making external API calls
CREATE EXTENSION IF NOT EXISTS http;

-- Note: This extension must be enabled by a superuser
-- If you get a permission error, run this in the Supabase SQL Editor:
-- It should already be available in most Supabase projects
