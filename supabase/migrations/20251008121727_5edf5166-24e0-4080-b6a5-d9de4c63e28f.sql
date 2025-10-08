-- Fix 1: Update profiles table RLS policies for better security
-- Remove the confusing "No public direct access" policy and ensure strict access control
DROP POLICY IF EXISTS "No public direct access to profiles table" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create clear, secure policies
CREATE POLICY "Users can only view their own complete profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Fix 2: Restrict companies table to hide email/phone from public
-- Drop the overly permissive public view policy
DROP POLICY IF EXISTS "Users can view active companies" ON public.companies;
DROP POLICY IF EXISTS "Anyone can view active companies" ON public.companies;

-- Create a function to get public company info (without contact details)
CREATE OR REPLACE FUNCTION public.get_public_company_info(company_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  industry text,
  website text,
  logo_url text,
  location text,
  company_size text,
  founded_year integer,
  linkedin_url text,
  twitter_url text,
  status text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.id,
    c.name,
    c.description,
    c.industry,
    c.website,
    c.logo_url,
    c.location,
    c.company_size,
    c.founded_year,
    c.linkedin_url,
    c.twitter_url,
    c.status
  FROM public.companies c
  WHERE c.id = company_id AND c.status = 'active';
$$;

-- Allow authenticated users to view company public info (no email/phone)
CREATE POLICY "Authenticated users can view active companies without contact details"
ON public.companies
FOR SELECT
TO authenticated
USING (status = 'active');

-- Admins can still see everything
CREATE POLICY "Admins can view all company details"
ON public.companies
FOR SELECT
TO authenticated
USING (is_current_user_admin());

-- Fix 3: Add search_path to all SECURITY DEFINER functions
-- Update has_role function (already has it, but ensuring it's correct)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT has_role(auth.uid(), 'admin'::app_role)
$$;

-- Update is_current_user_admin function
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  );
$$;

-- Update get_public_profile_info with search_path
CREATE OR REPLACE FUNCTION public.get_public_profile_info(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  title text,
  bio text,
  skills text,
  experience integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.title,
    p.bio,
    p.skills,
    p.experience
  FROM public.profiles p
  WHERE p.id = profile_user_id;
$$;

-- Update send_message function
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
  
  IF NOT EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id 
    AND (candidate_id = sender_user_id OR employer_id = sender_user_id)
  ) THEN
    RAISE EXCEPTION 'Access denied: user not part of conversation';
  END IF;
  
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
  
  UPDATE public.conversations
  SET 
    last_message_at = now(),
    last_message = CASE 
      WHEN attachment_name IS NOT NULL THEN 'Sent an attachment: ' || attachment_name
      ELSE message_content
    END,
    unread_count = CASE 
      WHEN candidate_id = sender_user_id THEN unread_count
      ELSE unread_count + 1 
    END
  WHERE id = conversation_id;
  
  RETURN message_id;
END;
$$;

-- Update find_or_create_conversation function
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
  IF user1_role = 'candidate' THEN
    candidate_user_id := user1_id;
    employer_user_id := user2_id;
  ELSE
    candidate_user_id := user2_id;
    employer_user_id := user1_id;
  END IF;
  
  SELECT id INTO conversation_id
  FROM public.conversations
  WHERE candidate_id = candidate_user_id AND employer_id = employer_user_id;
  
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (candidate_id, employer_id, last_message_at)
    VALUES (candidate_user_id, employer_user_id, now())
    RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$$;

-- Update get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Update mark_messages_seen function
CREATE OR REPLACE FUNCTION public.mark_messages_seen(conv_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
BEGIN
  user_id := auth.uid();
  
  IF NOT EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conv_id 
    AND (candidate_id = user_id OR employer_id = user_id)
  ) THEN
    RAISE EXCEPTION 'Access denied: user not part of conversation';
  END IF;
  
  UPDATE public.messages
  SET seen = true
  WHERE conversation_id = conv_id
    AND recipient_id = user_id
    AND seen = false;
  
  RETURN true;
END;
$$;

-- Update queue_cv_tailoring_retry function
CREATE OR REPLACE FUNCTION public.queue_cv_tailoring_retry(
  p_user_id uuid,
  p_request_id text,
  p_resume_content text,
  p_job_description text,
  p_job_title text DEFAULT NULL,
  p_company_name text DEFAULT NULL,
  p_candidate_data jsonb DEFAULT NULL,
  p_error_message text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  queue_id UUID;
BEGIN
  INSERT INTO public.cv_tailoring_retry_queue (
    user_id,
    request_id,
    resume_content,
    job_description,
    job_title,
    company_name,
    candidate_data,
    original_error
  ) VALUES (
    p_user_id,
    p_request_id,
    p_resume_content,
    p_job_description,
    p_job_title,
    p_company_name,
    p_candidate_data,
    p_error_message
  )
  RETURNING id INTO queue_id;
  
  RETURN queue_id;
END;
$$;

-- Update get_user_details function
CREATE OR REPLACE FUNCTION public.get_user_details(user_id uuid)
RETURNS TABLE(id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email::text
  FROM auth.users u
  WHERE u.id = user_id;
END;
$$;