
-- Add Row Level Security policies for conversations table (skip if already enabled)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'conversations' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop and recreate policies for conversations to ensure they're correct
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;

-- Policy for conversations: users can view conversations they are part of
CREATE POLICY "Users can view their own conversations" 
ON public.conversations 
FOR SELECT 
USING (
  auth.uid() = candidate_id OR auth.uid() = employer_id
);

-- Policy for conversations: authenticated users can create conversations
CREATE POLICY "Users can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (
  auth.uid() = candidate_id OR auth.uid() = employer_id
);

-- Policy for conversations: users can update their own conversations
CREATE POLICY "Users can update their own conversations" 
ON public.conversations 
FOR UPDATE 
USING (
  auth.uid() = candidate_id OR auth.uid() = employer_id
);

-- Add Row Level Security policies for messages table (skip if already enabled)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'messages' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop and recreate policies for messages to ensure they're correct
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- Policy for messages: users can view messages in conversations they are part of
CREATE POLICY "Users can view messages in their conversations" 
ON public.messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id 
    AND (candidate_id = auth.uid() OR employer_id = auth.uid())
  )
);

-- Policy for messages: users can create messages in conversations they are part of
CREATE POLICY "Users can create messages in their conversations" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id 
    AND (candidate_id = auth.uid() OR employer_id = auth.uid())
  )
  AND sender_id = auth.uid()
);

-- Policy for messages: users can update their own messages
CREATE POLICY "Users can update their own messages" 
ON public.messages 
FOR UPDATE 
USING (sender_id = auth.uid());

-- Create function to find or create conversation between two users
CREATE OR REPLACE FUNCTION public.find_or_create_conversation(
  user1_id uuid,
  user2_id uuid,
  user1_role text DEFAULT 'candidate',
  user2_role text DEFAULT 'employer'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conversation_id uuid;
  candidate_user_id uuid;
  employer_user_id uuid;
BEGIN
  -- Determine who is the candidate and who is the employer
  IF user1_role = 'candidate' THEN
    candidate_user_id := user1_id;
    employer_user_id := user2_id;
  ELSE
    candidate_user_id := user2_id;
    employer_user_id := user1_id;
  END IF;
  
  -- Try to find existing conversation
  SELECT id INTO conversation_id
  FROM public.conversations
  WHERE candidate_id = candidate_user_id AND employer_id = employer_user_id;
  
  -- If no conversation exists, create one
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (candidate_id, employer_id, last_message_at)
    VALUES (candidate_user_id, employer_user_id, now())
    RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$$;

-- Create function to send a message
CREATE OR REPLACE FUNCTION public.send_message(
  conversation_id uuid,
  recipient_id uuid,
  message_content text
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
  
  -- Insert the message
  INSERT INTO public.messages (
    conversation_id,
    sender_id,
    recipient_id,
    content,
    sent_at
  )
  VALUES (
    conversation_id,
    sender_user_id,
    recipient_id,
    message_content,
    now()
  )
  RETURNING id INTO message_id;
  
  -- Update conversation last_message_at and last_message
  UPDATE public.conversations
  SET 
    last_message_at = now(),
    last_message = message_content,
    unread_count = CASE 
      WHEN candidate_id = sender_user_id THEN unread_count -- Don't increment for sender
      ELSE unread_count + 1 
    END
  WHERE id = conversation_id;
  
  RETURN message_id;
END;
$$;

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_messages_read(
  conversation_id uuid
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
    WHERE id = conversation_id 
    AND (candidate_id = user_id OR employer_id = user_id)
  ) THEN
    RAISE EXCEPTION 'Access denied: user not part of conversation';
  END IF;
  
  -- Mark messages as read
  UPDATE public.messages
  SET read = true
  WHERE conversation_id = mark_messages_read.conversation_id
    AND recipient_id = user_id
    AND read = false;
  
  -- Reset unread count for this user's side
  UPDATE public.conversations
  SET unread_count = 0
  WHERE id = conversation_id;
  
  RETURN true;
END;
$$;
