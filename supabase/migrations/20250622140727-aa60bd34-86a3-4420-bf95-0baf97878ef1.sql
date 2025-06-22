
-- Add sponsored column to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS sponsored boolean NOT NULL DEFAULT true;

-- Drop existing admin functions before recreating them with sponsored field
DROP FUNCTION IF EXISTS public.admin_get_job(uuid);
DROP FUNCTION IF EXISTS public.admin_create_job(text, text, text, text, text[], text, text, integer, integer, text, text[], boolean, boolean, text, timestamp with time zone, text, text, text, text, uuid);
DROP FUNCTION IF EXISTS public.admin_update_job(uuid, text, text, text, text, text[], text, text, integer, integer, text, text[], boolean, boolean, text, timestamp with time zone, text, text, text, text);

-- Update admin job creation function to handle sponsored field
CREATE OR REPLACE FUNCTION public.admin_create_job(
  job_title text,
  job_company text,
  job_location text,
  job_description text,
  job_requirements text[],
  job_employment_type text,
  job_experience_level text,
  job_salary_min integer DEFAULT NULL,
  job_salary_max integer DEFAULT NULL,
  job_salary_currency text DEFAULT 'USD',
  job_tech_stack text[] DEFAULT '{}',
  job_visa_sponsorship boolean DEFAULT false,
  job_remote boolean DEFAULT false,
  job_company_size text DEFAULT NULL,
  job_application_deadline timestamp with time zone DEFAULT NULL,
  job_logo text DEFAULT NULL,
  job_status text DEFAULT 'active',
  job_application_type text DEFAULT 'internal',
  job_application_value text DEFAULT NULL,
  job_employer_id uuid DEFAULT NULL,
  job_sponsored boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_job_id uuid;
BEGIN
  -- Only allow admin users to call this function
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Insert the job
  INSERT INTO public.jobs (
    title,
    company,
    location,
    description,
    requirements,
    salary_min,
    salary_max,
    salary_currency,
    employment_type,
    experience_level,
    tech_stack,
    visa_sponsorship,
    remote,
    company_size,
    application_deadline,
    logo,
    status,
    application_type,
    application_value,
    employer_id,
    sponsored
  )
  VALUES (
    job_title,
    job_company,
    job_location,
    job_description,
    job_requirements,
    job_salary_min,
    job_salary_max,
    job_salary_currency,
    job_employment_type,
    job_experience_level,
    job_tech_stack,
    job_visa_sponsorship,
    job_remote,
    job_company_size,
    job_application_deadline,
    job_logo,
    job_status,
    job_application_type,
    job_application_value,
    COALESCE(job_employer_id, auth.uid()),
    job_sponsored
  )
  RETURNING id INTO new_job_id;

  RETURN new_job_id;
END;
$function$;

-- Update admin job update function to handle sponsored field
CREATE OR REPLACE FUNCTION public.admin_update_job(
  job_id uuid,
  job_title text,
  job_company text,
  job_location text,
  job_description text,
  job_requirements text[],
  job_employment_type text,
  job_experience_level text,
  job_salary_min integer DEFAULT NULL,
  job_salary_max integer DEFAULT NULL,
  job_salary_currency text DEFAULT 'USD',
  job_tech_stack text[] DEFAULT '{}',
  job_visa_sponsorship boolean DEFAULT false,
  job_remote boolean DEFAULT false,
  job_company_size text DEFAULT NULL,
  job_application_deadline timestamp with time zone DEFAULT NULL,
  job_logo text DEFAULT NULL,
  job_status text DEFAULT 'active',
  job_application_type text DEFAULT 'internal',
  job_application_value text DEFAULT NULL,
  job_sponsored boolean DEFAULT true
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow admin users to call this function
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Update the job
  UPDATE public.jobs 
  SET 
    title = job_title,
    company = job_company,
    location = job_location,
    description = job_description,
    requirements = job_requirements,
    salary_min = job_salary_min,
    salary_max = job_salary_max,
    salary_currency = job_salary_currency,
    employment_type = job_employment_type,
    experience_level = job_experience_level,
    tech_stack = job_tech_stack,
    visa_sponsorship = job_visa_sponsorship,
    remote = job_remote,
    company_size = job_company_size,
    application_deadline = job_application_deadline,
    logo = job_logo,
    status = job_status,
    application_type = job_application_type,
    application_value = job_application_value,
    sponsored = job_sponsored,
    updated_at = now()
  WHERE id = job_id;

  RETURN true;
END;
$function$;

-- Update admin get job function to return sponsored field
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
  sponsored boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    j.sponsored,
    j.created_at,
    j.updated_at
  FROM public.jobs j
  WHERE j.id = job_id;
END;
$function$;
