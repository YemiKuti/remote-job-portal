-- Fix security issue in the retry queue function by setting search_path
CREATE OR REPLACE FUNCTION public.queue_cv_tailoring_retry(
  p_user_id UUID,
  p_request_id TEXT,
  p_resume_content TEXT,
  p_job_description TEXT,
  p_job_title TEXT DEFAULT NULL,
  p_company_name TEXT DEFAULT NULL,
  p_candidate_data JSONB DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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