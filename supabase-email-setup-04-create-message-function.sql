-- Step 4: Create function to create email messages for later sending (optional)
CREATE OR REPLACE FUNCTION public.create_email_message(message jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_message_id uuid;
    sender_email text;
    recipient_email text;
    subject_text text;
    html_content text;
    text_content text;
    message_metadata jsonb;
BEGIN
    -- Extract message details
    sender_email := message->>'sender';
    recipient_email := message->>'recipient';
    subject_text := message->>'subject';
    html_content := message->>'html_body';
    text_content := message->>'text_body';
    message_metadata := message->'metadata';
    
    -- Validate required fields
    IF sender_email IS NULL OR recipient_email IS NULL OR subject_text IS NULL THEN
        RAISE EXCEPTION 'sender, recipient, and subject are required fields';
    END IF;
    
    -- Insert message with status 'ready'
    INSERT INTO public.messages (
        sender,
        recipient,
        subject,
        html_body,
        text_body,
        status,
        metadata
    ) VALUES (
        sender_email,
        recipient_email,
        subject_text,
        html_content,
        text_content,
        'ready',
        message_metadata
    )
    RETURNING id INTO new_message_id;
    
    RETURN new_message_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_email_message(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_email_message(jsonb) TO service_role;

-- Add comment
COMMENT ON FUNCTION public.create_email_message IS 'Creates an email message in the messages table with status=ready for later sending';
