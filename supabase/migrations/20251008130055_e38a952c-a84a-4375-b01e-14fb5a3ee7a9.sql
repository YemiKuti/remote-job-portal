-- Create CV processing jobs table
CREATE TABLE IF NOT EXISTS public.cv_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id TEXT UNIQUE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  user_email TEXT,
  job_title TEXT,
  company_name TEXT,
  job_description TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  progress INTEGER DEFAULT 0,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 2,
  extracted_text TEXT,
  tailored_content TEXT,
  download_url TEXT,
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cv_jobs_user_id ON public.cv_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_jobs_job_id ON public.cv_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_cv_jobs_status ON public.cv_jobs(status);
CREATE INDEX IF NOT EXISTS idx_cv_jobs_created_at ON public.cv_jobs(created_at DESC);

-- Enable RLS
ALTER TABLE public.cv_jobs ENABLE ROW LEVEL SECURITY;

-- Users can view their own jobs
CREATE POLICY "Users can view their own CV jobs"
  ON public.cv_jobs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own jobs
CREATE POLICY "Users can create their own CV jobs"
  ON public.cv_jobs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own jobs
CREATE POLICY "Users can update their own CV jobs"
  ON public.cv_jobs
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all jobs
CREATE POLICY "Admins can view all CV jobs"
  ON public.cv_jobs
  FOR SELECT
  USING (public.is_current_user_admin());

-- Admins can update all jobs
CREATE POLICY "Admins can update all CV jobs"
  ON public.cv_jobs
  FOR UPDATE
  USING (public.is_current_user_admin());

-- Admins can delete jobs
CREATE POLICY "Admins can delete CV jobs"
  ON public.cv_jobs
  FOR DELETE
  USING (public.is_current_user_admin());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_cv_jobs_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_cv_jobs_updated_at_trigger ON public.cv_jobs;
CREATE TRIGGER update_cv_jobs_updated_at_trigger
  BEFORE UPDATE ON public.cv_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cv_jobs_updated_at();

-- Create function to get job statistics
CREATE OR REPLACE FUNCTION public.get_cv_job_stats()
RETURNS TABLE(
  total_jobs BIGINT,
  queued_jobs BIGINT,
  processing_jobs BIGINT,
  completed_jobs BIGINT,
  failed_jobs BIGINT,
  avg_processing_time INTERVAL
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*)::BIGINT as total_jobs,
    COUNT(*) FILTER (WHERE status = 'queued')::BIGINT as queued_jobs,
    COUNT(*) FILTER (WHERE status = 'processing')::BIGINT as processing_jobs,
    COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_jobs,
    COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_jobs,
    AVG(processing_completed_at - processing_started_at) FILTER (WHERE status = 'completed') as avg_processing_time
  FROM public.cv_jobs
  WHERE public.is_current_user_admin();
$$;

-- Create admin function to retry failed jobs
CREATE OR REPLACE FUNCTION public.admin_retry_cv_job(p_job_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  UPDATE public.cv_jobs
  SET 
    status = 'queued',
    retry_count = retry_count + 1,
    error_message = NULL,
    progress = 0,
    processing_started_at = NULL,
    processing_completed_at = NULL,
    updated_at = now()
  WHERE id = p_job_id
    AND status = 'failed'
    AND retry_count < max_retries;

  RETURN FOUND;
END;
$$;

-- Create admin function to delete job
CREATE OR REPLACE FUNCTION public.admin_delete_cv_job(p_job_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  DELETE FROM public.cv_jobs WHERE id = p_job_id;
  RETURN FOUND;
END;
$$;