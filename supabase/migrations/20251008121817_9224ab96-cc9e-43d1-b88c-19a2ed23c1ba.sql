-- Fix remaining SECURITY DEFINER functions without search_path

-- Admin functions
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
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  admin_user_id := auth.uid();
  SELECT status INTO current_status FROM public.jobs WHERE id = job_id;
  
  IF current_status IS NULL THEN
    RAISE EXCEPTION 'Job not found.';
  END IF;

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

  INSERT INTO public.approval_log (
    job_id, action, performed_by, reason, previous_status, new_status, notes
  ) VALUES (
    job_id, 'approve', admin_user_id, approval_reason, current_status, 'active', review_notes
  );

  RETURN true;
END;
$$;

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
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  admin_user_id := auth.uid();
  SELECT status INTO current_status FROM public.jobs WHERE id = job_id;
  
  IF current_status IS NULL THEN
    RAISE EXCEPTION 'Job not found.';
  END IF;

  IF rejection_reason IS NULL OR trim(rejection_reason) = '' THEN
    RAISE EXCEPTION 'Rejection reason is required.';
  END IF;

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

  INSERT INTO public.approval_log (
    job_id, action, performed_by, reason, previous_status, new_status, notes
  ) VALUES (
    job_id, 'reject', admin_user_id, rejection_reason, current_status, 'draft', review_notes
  );

  RETURN true;
END;
$$;

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
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

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
SET search_path = public
AS $$
DECLARE
  new_job_id uuid;
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  INSERT INTO public.jobs (
    title, company, location, description, requirements, salary_min, salary_max,
    salary_currency, employment_type, experience_level, tech_stack, visa_sponsorship,
    remote, company_size, application_deadline, logo, status, application_type,
    application_value, employer_id, sponsored
  )
  VALUES (
    job_title, job_company, job_location, job_description, job_requirements,
    job_salary_min, job_salary_max, job_salary_currency, job_employment_type,
    job_experience_level, job_tech_stack, job_visa_sponsorship, job_remote,
    job_company_size, job_application_deadline, job_logo, job_status,
    job_application_type, job_application_value, COALESCE(job_employer_id, auth.uid()),
    job_sponsored
  )
  RETURNING id INTO new_job_id;

  RETURN new_job_id;
END;
$$;

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
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

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
$$;

CREATE OR REPLACE FUNCTION public.admin_get_job(job_id uuid)
RETURNS TABLE(
  id uuid, title text, company text, location text, description text,
  requirements text[], salary_min integer, salary_max integer,
  salary_currency text, employment_type text, experience_level text,
  tech_stack text[], visa_sponsorship boolean, remote boolean,
  company_size text, application_deadline timestamp with time zone,
  logo text, status text, application_type text, application_value text,
  employer_id uuid, sponsored boolean, created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT 
    j.id, j.title, j.company, j.location, j.description, j.requirements,
    j.salary_min, j.salary_max, j.salary_currency, j.employment_type,
    j.experience_level, j.tech_stack, j.visa_sponsorship, j.remote,
    j.company_size, j.application_deadline, j.logo, j.status,
    j.application_type, j.application_value, j.employer_id, j.sponsored,
    j.created_at, j.updated_at
  FROM public.jobs j
  WHERE j.id = job_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_create_job_with_email(
  job_title text,
  job_company text,
  job_location text,
  job_description text,
  job_requirements text[],
  job_employment_type text,
  job_experience_level text,
  job_apply_email text DEFAULT NULL,
  job_salary_min integer DEFAULT NULL,
  job_salary_max integer DEFAULT NULL,
  job_salary_currency text DEFAULT 'USD',
  job_tech_stack text[] DEFAULT '{}',
  job_visa_sponsorship boolean DEFAULT false,
  job_remote boolean DEFAULT false,
  job_company_size text DEFAULT NULL,
  job_application_deadline timestamp with time zone DEFAULT NULL,
  job_logo text DEFAULT NULL,
  job_status text DEFAULT 'pending',
  job_application_type text DEFAULT 'external',
  job_application_value text DEFAULT NULL,
  job_employer_id uuid DEFAULT NULL,
  job_sponsored boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_job_id uuid;
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  IF job_application_type = 'external' AND job_application_value IS NULL AND job_apply_email IS NOT NULL THEN
    job_application_value := job_apply_email;
  END IF;

  INSERT INTO public.jobs (
    title, company, location, description, requirements, salary_min, salary_max,
    salary_currency, employment_type, experience_level, tech_stack,
    visa_sponsorship, remote, company_size, application_deadline, logo, status,
    application_type, application_value, apply_email, employer_id, sponsored
  )
  VALUES (
    job_title, job_company, job_location, job_description, job_requirements,
    job_salary_min, job_salary_max, job_salary_currency, job_employment_type,
    job_experience_level, job_tech_stack, job_visa_sponsorship, job_remote,
    job_company_size, job_application_deadline, job_logo, job_status,
    job_application_type, job_application_value, job_apply_email,
    COALESCE(job_employer_id, auth.uid()), job_sponsored
  )
  RETURNING id INTO new_job_id;

  RETURN new_job_id;
END;
$$;