-- Create retry queue table for failed CV tailoring requests
CREATE TABLE IF NOT EXISTS public.cv_tailoring_retry_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  request_id TEXT NOT NULL,
  resume_content TEXT NOT NULL,
  job_description TEXT NOT NULL,
  job_title TEXT,
  company_name TEXT,
  candidate_data JSONB,
  original_error TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_retry_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  result_data JSONB
);

-- Enable RLS on the retry queue
ALTER TABLE public.cv_tailoring_retry_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for the retry queue
CREATE POLICY "Users can view their own retry requests" 
ON public.cv_tailoring_retry_queue 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own retry requests" 
ON public.cv_tailoring_retry_queue 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own retry requests" 
ON public.cv_tailoring_retry_queue 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_cv_tailoring_retry_queue_user_status 
ON public.cv_tailoring_retry_queue(user_id, status);

CREATE INDEX IF NOT EXISTS idx_cv_tailoring_retry_queue_created_at 
ON public.cv_tailoring_retry_queue(created_at);

-- Create function to automatically retry failed requests
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