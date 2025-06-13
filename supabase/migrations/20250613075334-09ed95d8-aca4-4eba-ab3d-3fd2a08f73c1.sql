
-- First drop the existing function
DROP FUNCTION IF EXISTS public.mark_messages_read(uuid);

-- Then create the new function with the corrected parameter name
CREATE OR REPLACE FUNCTION public.mark_messages_read(
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
  
  -- Mark messages as read
  UPDATE public.messages
  SET read = true
  WHERE conversation_id = conv_id
    AND recipient_id = user_id
    AND read = false;
  
  -- Reset unread count for this user's side
  UPDATE public.conversations
  SET unread_count = 0
  WHERE id = conv_id;
  
  RETURN true;
END;
$$;
