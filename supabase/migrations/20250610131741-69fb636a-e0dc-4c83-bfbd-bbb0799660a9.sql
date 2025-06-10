
-- Create admin function to create jobs with proper permissions (fixed parameter defaults)
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
  job_employer_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    employer_id
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
    COALESCE(job_employer_id, auth.uid())
  )
  RETURNING id INTO new_job_id;

  RETURN new_job_id;
END;
$$;

-- Create admin function to update jobs with proper permissions (fixed parameter defaults)
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
  job_application_value text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    updated_at = now()
  WHERE id = job_id;

  RETURN true;
END;
$$;
