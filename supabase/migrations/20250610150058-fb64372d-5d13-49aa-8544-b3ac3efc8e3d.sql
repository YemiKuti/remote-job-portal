
-- Create approval_log table for audit trail
CREATE TABLE public.approval_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('approve', 'reject', 'pending', 'resubmit')),
  performed_by uuid NOT NULL,
  performed_at timestamp with time zone NOT NULL DEFAULT now(),
  reason text,
  previous_status text,
  new_status text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add new fields to jobs table for better approval tracking
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS rejection_reason text,
ADD COLUMN IF NOT EXISTS approval_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS approved_by uuid,
ADD COLUMN IF NOT EXISTS rejected_by uuid,
ADD COLUMN IF NOT EXISTS rejection_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_reviewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS review_notes text;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_approval_log_job_id ON public.approval_log(job_id);
CREATE INDEX IF NOT EXISTS idx_approval_log_performed_by ON public.approval_log(performed_by);
CREATE INDEX IF NOT EXISTS idx_approval_log_action ON public.approval_log(action);
CREATE INDEX IF NOT EXISTS idx_approval_log_performed_at ON public.approval_log(performed_at);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_approved_by ON public.jobs(approved_by);
CREATE INDEX IF NOT EXISTS idx_jobs_approval_date ON public.jobs(approval_date);

-- Enable RLS on approval_log table
ALTER TABLE public.approval_log ENABLE ROW LEVEL SECURITY;

-- Create policy for approval_log - only admins can view
CREATE POLICY "Admins can view approval logs" 
ON public.approval_log 
FOR SELECT 
USING (public.is_current_user_admin() = true);

-- Create policy for approval_log - only admins can insert
CREATE POLICY "Admins can create approval logs" 
ON public.approval_log 
FOR INSERT 
WITH CHECK (public.is_current_user_admin() = true);

-- Create enhanced admin function for job approval with logging
CREATE OR REPLACE FUNCTION public.admin_approve_job(
  job_id uuid,
  approval_reason text DEFAULT NULL,
  review_notes text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_status text;
  admin_user_id uuid;
BEGIN
  -- Only allow admin users to call this function
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  admin_user_id := auth.uid();
  
  -- Get current job status
  SELECT status INTO current_status FROM public.jobs WHERE id = job_id;
  
  IF current_status IS NULL THEN
    RAISE EXCEPTION 'Job not found.';
  END IF;

  -- Update job status and approval fields
  UPDATE public.jobs 
  SET 
    status = 'active',
    approved_by = admin_user_id,
    approval_date = now(),
    last_reviewed_at = now(),
    review_notes = approval_reason,
    rejection_reason = NULL,
    rejected_by = NULL,
    rejection_date = NULL,
    updated_at = now()
  WHERE id = job_id;

  -- Log the approval action
  INSERT INTO public.approval_log (
    job_id,
    action,
    performed_by,
    reason,
    previous_status,
    new_status,
    notes
  ) VALUES (
    job_id,
    'approve',
    admin_user_id,
    approval_reason,
    current_status,
    'active',
    review_notes
  );

  RETURN true;
END;
$$;

-- Create enhanced admin function for job rejection with logging
CREATE OR REPLACE FUNCTION public.admin_reject_job(
  job_id uuid,
  rejection_reason text,
  review_notes text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_status text;
  admin_user_id uuid;
BEGIN
  -- Only allow admin users to call this function
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  admin_user_id := auth.uid();
  
  -- Get current job status
  SELECT status INTO current_status FROM public.jobs WHERE id = job_id;
  
  IF current_status IS NULL THEN
    RAISE EXCEPTION 'Job not found.';
  END IF;

  -- Validate rejection reason
  IF rejection_reason IS NULL OR trim(rejection_reason) = '' THEN
    RAISE EXCEPTION 'Rejection reason is required.';
  END IF;

  -- Update job status and rejection fields
  UPDATE public.jobs 
  SET 
    status = 'draft',
    rejected_by = admin_user_id,
    rejection_date = now(),
    rejection_reason = rejection_reason,
    last_reviewed_at = now(),
    review_notes = review_notes,
    approved_by = NULL,
    approval_date = NULL,
    updated_at = now()
  WHERE id = job_id;

  -- Log the rejection action
  INSERT INTO public.approval_log (
    job_id,
    action,
    performed_by,
    reason,
    previous_status,
    new_status,
    notes
  ) VALUES (
    job_id,
    'reject',
    admin_user_id,
    rejection_reason,
    current_status,
    'draft',
    review_notes
  );

  RETURN true;
END;
$$;

-- Create function for batch job operations
CREATE OR REPLACE FUNCTION public.admin_batch_approve_jobs(
  job_ids uuid[],
  approval_reason text DEFAULT NULL
)
RETURNS TABLE(job_id uuid, success boolean, error_message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  job_id_item uuid;
BEGIN
  -- Only allow admin users to call this function
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Process each job ID
  FOREACH job_id_item IN ARRAY job_ids
  LOOP
    BEGIN
      PERFORM public.admin_approve_job(job_id_item, approval_reason);
      RETURN QUERY SELECT job_id_item, true, NULL::text;
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT job_id_item, false, SQLERRM;
    END;
  END LOOP;
END;
$$;

-- Create function to get approval history for a job
CREATE OR REPLACE FUNCTION public.admin_get_job_approval_history(job_id uuid)
RETURNS TABLE(
  id uuid,
  action text,
  performed_by uuid,
  performed_at timestamp with time zone,
  reason text,
  previous_status text,
  new_status text,
  notes text,
  performer_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admin users to call this function
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT 
    al.id,
    al.action,
    al.performed_by,
    al.performed_at,
    al.reason,
    al.previous_status,
    al.new_status,
    al.notes,
    COALESCE(p.full_name, p.username, 'Unknown') as performer_name
  FROM public.approval_log al
  LEFT JOIN public.profiles p ON al.performed_by = p.id
  WHERE al.job_id = admin_get_job_approval_history.job_id
  ORDER BY al.performed_at DESC;
END;
$$;
