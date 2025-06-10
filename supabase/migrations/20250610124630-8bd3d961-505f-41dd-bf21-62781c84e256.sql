
-- Create admin function to get all jobs with proper permissions
CREATE OR REPLACE FUNCTION public.get_admin_jobs()
RETURNS TABLE(
  id uuid,
  title text,
  company text,
  location text,
  created_at timestamp with time zone,
  status text,
  applications integer,
  description text,
  requirements text[],
  salary_min integer,
  salary_max integer,
  employment_type text,
  experience_level text,
  tech_stack text[],
  employer_id uuid,
  is_featured boolean,
  views integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only allow admin users to call this function
  SELECT j.id, j.title, j.company, j.location, j.created_at, j.status, j.applications,
         j.description, j.requirements, j.salary_min, j.salary_max, j.employment_type,
         j.experience_level, j.tech_stack, j.employer_id, j.is_featured, j.views
  FROM public.jobs j
  WHERE public.is_current_user_admin() = true
  ORDER BY j.created_at DESC;
$$;

-- Create admin function to update job status
CREATE OR REPLACE FUNCTION public.admin_update_job_status(job_id uuid, new_status text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.jobs 
  SET status = new_status, updated_at = now()
  WHERE id = job_id AND public.is_current_user_admin() = true;
  
  SELECT public.is_current_user_admin();
$$;
