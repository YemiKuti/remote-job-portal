
-- Create admin function to get a specific job with proper permissions
CREATE OR REPLACE FUNCTION public.admin_get_job(job_id uuid)
RETURNS TABLE(
  id uuid,
  title text,
  company text,
  location text,
  description text,
  requirements text[],
  salary_min integer,
  salary_max integer,
  salary_currency text,
  employment_type text,
  experience_level text,
  tech_stack text[],
  visa_sponsorship boolean,
  remote boolean,
  company_size text,
  application_deadline timestamp with time zone,
  logo text,
  status text,
  application_type text,
  application_value text,
  employer_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
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

  -- Return the job data
  RETURN QUERY
  SELECT 
    j.id,
    j.title,
    j.company,
    j.location,
    j.description,
    j.requirements,
    j.salary_min,
    j.salary_max,
    j.salary_currency,
    j.employment_type,
    j.experience_level,
    j.tech_stack,
    j.visa_sponsorship,
    j.remote,
    j.company_size,
    j.application_deadline,
    j.logo,
    j.status,
    j.application_type,
    j.application_value,
    j.employer_id,
    j.created_at,
    j.updated_at
  FROM public.jobs j
  WHERE j.id = job_id;
END;
$$;
