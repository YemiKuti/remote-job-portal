
-- Add seen column to messages table
ALTER TABLE public.messages 
ADD COLUMN seen BOOLEAN NOT NULL DEFAULT false;

-- Update the send_message function to handle the seen status
CREATE OR REPLACE FUNCTION public.send_message(
  conversation_id uuid,
  recipient_id uuid,
  message_content text,
  attachment_url text DEFAULT NULL,
  attachment_name text DEFAULT NULL,
  attachment_size integer DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  message_id uuid;
  sender_user_id uuid;
BEGIN
  sender_user_id := auth.uid();
  
  -- Verify the user is part of this conversation
  IF NOT EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id 
    AND (candidate_id = sender_user_id OR employer_id = sender_user_id)
  ) THEN
    RAISE EXCEPTION 'Access denied: user not part of conversation';
  END IF;
  
  -- Insert the message with attachment info
  INSERT INTO public.messages (
    conversation_id,
    sender_id,
    recipient_id,
    content,
    attachment_url,
    attachment_name,
    attachment_size,
    sent_at,
    seen
  )
  VALUES (
    conversation_id,
    sender_user_id,
    recipient_id,
    message_content,
    attachment_url,
    attachment_name,
    attachment_size,
    now(),
    false
  )
  RETURNING id INTO message_id;
  
  -- Update conversation last_message_at and last_message
  UPDATE public.conversations
  SET 
    last_message_at = now(),
    last_message = CASE 
      WHEN attachment_name IS NOT NULL THEN 'Sent an attachment: ' || attachment_name
      ELSE message_content
    END,
    unread_count = CASE 
      WHEN candidate_id = sender_user_id THEN unread_count -- Don't increment for sender
      ELSE unread_count + 1 
    END
  WHERE id = conversation_id;
  
  RETURN message_id;
END;
$$;

-- Create a function to mark messages as seen
CREATE OR REPLACE FUNCTION public.mark_messages_seen(
  conv_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
BEGIN
  user_id := auth.uid();
  
  -- Verify the user is part of this conversation
  IF NOT EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conv_id 
    AND (candidate_id = user_id OR employer_id = user_id)
  ) THEN
    RAISE EXCEPTION 'Access denied: user not part of conversation';
  END IF;
  
  -- Mark messages as seen
  UPDATE public.messages
  SET seen = true
  WHERE conversation_id = conv_id
    AND recipient_id = user_id
    AND seen = false;
  
  RETURN true;
END;
$$;
