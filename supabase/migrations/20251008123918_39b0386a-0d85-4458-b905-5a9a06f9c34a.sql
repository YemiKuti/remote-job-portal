-- Fix remaining SECURITY DEFINER trigger functions without search_path
-- This prevents search path manipulation attacks on all trigger functions

-- Trigger function for cv_analysis
CREATE OR REPLACE FUNCTION public.update_cv_analysis_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Trigger function for jobs expiration
CREATE OR REPLACE FUNCTION public.set_job_expiration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Set posted_at when status changes to 'active' and it wasn't set before
  IF NEW.status = 'active' AND (OLD.status != 'active' OR OLD.posted_at IS NULL) THEN
    NEW.posted_at = now();
    NEW.expires_at = now() + INTERVAL '6 months';
  END IF;
  
  -- If job is being reactivated, extend expiration by 6 months from now
  IF NEW.status = 'active' AND OLD.status IN ('expired', 'inactive') AND OLD.posted_at IS NOT NULL THEN
    NEW.posted_at = now();
    NEW.expires_at = now() + INTERVAL '6 months';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Trigger function for tailored_resumes
CREATE OR REPLACE FUNCTION public.update_tailored_resumes_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Trigger function for cv_tailoring_sessions
CREATE OR REPLACE FUNCTION public.update_cv_tailoring_sessions_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Trigger function for expiring old jobs
CREATE OR REPLACE FUNCTION public.expire_old_jobs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE public.jobs 
  SET status = 'expired'
  WHERE status = 'active' 
    AND expires_at < now();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$function$;

-- Trigger function for resumes
CREATE OR REPLACE FUNCTION public.update_resumes_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Trigger function for auto-generating post slugs
CREATE OR REPLACE FUNCTION public.auto_generate_post_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Only generate slug if it's null or empty
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := public.generate_slug(NEW.title);
    final_slug := base_slug;
    
    -- Check for uniqueness and append number if needed
    WHILE EXISTS (SELECT 1 FROM public.posts WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  -- Update reading time estimate (average 200 words per minute)
  IF NEW.content IS NOT NULL THEN
    NEW.reading_time := GREATEST(1, (array_length(string_to_array(NEW.content, ' '), 1) / 200.0)::INTEGER);
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

-- Trigger function for application notifications
CREATE OR REPLACE FUNCTION public.create_application_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Notify candidate about status change
  IF OLD.status != NEW.status THEN
    INSERT INTO public.candidate_notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.user_id,
      'application_update',
      'Application Status Updated',
      'Your application status has been changed to: ' || NEW.status,
      jsonb_build_object('application_id', NEW.id, 'job_id', NEW.job_id, 'old_status', OLD.status, 'new_status', NEW.status)
    );
    
    -- Notify employer about status change if it's a withdrawal
    IF NEW.status = 'withdrawn' THEN
      INSERT INTO public.employer_notifications (user_id, type, title, message, metadata)
      VALUES (
        NEW.employer_id,
        'application_status_update',
        'Application Withdrawn',
        'A candidate has withdrawn their application',
        jsonb_build_object('application_id', NEW.id, 'job_id', NEW.job_id, 'candidate_id', NEW.user_id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Trigger function for new application notifications
CREATE OR REPLACE FUNCTION public.create_new_application_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.employer_notifications (user_id, type, title, message, metadata)
  VALUES (
    NEW.employer_id,
    'new_application',
    'New Job Application',
    'You have received a new application for your job posting',
    jsonb_build_object('application_id', NEW.id, 'job_id', NEW.job_id, 'candidate_id', NEW.user_id)
  );
  
  RETURN NEW;
END;
$function$;

-- Trigger function for message notifications
CREATE OR REPLACE FUNCTION public.create_message_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  conversation_data RECORD;
  recipient_role TEXT;
BEGIN
  -- Get conversation details
  SELECT * INTO conversation_data FROM public.conversations WHERE id = NEW.conversation_id;
  
  -- Determine recipient role and create appropriate notification
  IF NEW.recipient_id = conversation_data.candidate_id THEN
    recipient_role := 'candidate';
    INSERT INTO public.candidate_notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.recipient_id,
      'new_message',
      'New Message',
      'You have received a new message',
      jsonb_build_object('conversation_id', NEW.conversation_id, 'sender_id', NEW.sender_id, 'message_id', NEW.id)
    );
  ELSE
    recipient_role := 'employer';
    INSERT INTO public.employer_notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.recipient_id,
      'new_message',
      'New Message',
      'You have received a new message from a candidate',
      jsonb_build_object('conversation_id', NEW.conversation_id, 'sender_id', NEW.sender_id, 'message_id', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Trigger function for profile view notifications
CREATE OR REPLACE FUNCTION public.create_profile_view_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.candidate_notifications (user_id, type, title, message, metadata)
  VALUES (
    NEW.profile_id,
    'profile_view',
    'Profile Viewed',
    'Someone viewed your profile',
    jsonb_build_object('viewer_id', NEW.viewer_id, 'viewed_at', NEW.viewed_at)
  );
  
  RETURN NEW;
END;
$function$;

-- Trigger function for profiles updated_at
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Trigger function for handling new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_role text;
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username', 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  
  user_role := new.raw_user_meta_data->>'role';
  
  IF user_role IN ('candidate', 'employer') THEN
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (new.id, user_role::public.app_role, now())
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (new.id, 'candidate'::public.app_role, now())
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$function$;