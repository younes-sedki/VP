-- Step 2: Create send_email_message function for MailerSend
CREATE OR REPLACE FUNCTION public.send_email_message(message jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    email_provider text := 'mailersend';
    api_token text;
    api_url text;
    payload jsonb;
    response jsonb;
    http_response record;
    message_id uuid;
    sender_email text;
    sender_name text;
    recipient_email text;
    subject_text text;
    html_content text;
BEGIN
    -- Get API token from private.keys
    SELECT value INTO api_token 
    FROM private.keys 
    WHERE key = 'MAILERSEND_API_TOKEN';
    
    IF api_token IS NULL THEN
        RAISE EXCEPTION 'MAILERSEND_API_TOKEN not found in private.keys';
    END IF;
    
    -- Extract message details
    sender_email := message->>'sender';
    sender_name := COALESCE(message->>'sender_name', 'Newsletter');
    recipient_email := message->>'recipient';
    subject_text := message->>'subject';
    html_content := message->>'html_body';
    message_id := (message->>'messageid')::uuid;
    
    -- Validate required fields
    IF sender_email IS NULL OR recipient_email IS NULL OR subject_text IS NULL THEN
        RAISE EXCEPTION 'sender, recipient, and subject are required fields';
    END IF;
    
    -- Build MailerSend API payload
    payload := jsonb_build_object(
        'from', jsonb_build_object(
            'email', sender_email,
            'name', sender_name
        ),
        'to', jsonb_build_array(
            jsonb_build_object('email', recipient_email)
        ),
        'subject', subject_text,
        'html', COALESCE(html_content, message->>'text_body', '')
    );
    
    -- MailerSend API endpoint
    api_url := 'https://api.mailersend.com/v1/email';
    
    -- Make HTTP request to MailerSend
    SELECT * INTO http_response
    FROM http((
        'POST',
        api_url,
        ARRAY[
            http_header('Content-Type', 'application/json'),
            http_header('Authorization', 'Bearer ' || api_token),
            http_header('X-Requested-With', 'XMLHttpRequest')
        ],
        'application/json',
        payload::text
    ));
    
    -- Build response
    response := jsonb_build_object(
        'status', http_response.status,
        'provider', email_provider,
        'sent_at', now()
    );
    
    -- If messages table exists and messageid provided, update the message
    IF message_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'messages'
    ) THEN
        UPDATE public.messages
        SET 
            status = CASE 
                WHEN http_response.status BETWEEN 200 AND 299 THEN 'sent'
                ELSE 'failed'
            END,
            sent_at = now(),
            provider_response = response
        WHERE id = message_id;
    END IF;
    
    -- If messages table exists and no messageid, insert new record
    IF message_id IS NULL AND EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'messages'
    ) THEN
        INSERT INTO public.messages (
            sender,
            recipient,
            subject,
            html_body,
            status,
            sent_at,
            provider_response
        ) VALUES (
            sender_email,
            recipient_email,
            subject_text,
            html_content,
            CASE 
                WHEN http_response.status BETWEEN 200 AND 299 THEN 'sent'
                ELSE 'failed'
            END,
            now(),
            response
        );
    END IF;
    
    RETURN response;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.send_email_message(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_email_message(jsonb) TO anon;

-- Add comment
COMMENT ON FUNCTION public.send_email_message IS 'Sends an email message via MailerSend API';
