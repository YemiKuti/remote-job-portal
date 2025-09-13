-- Add apply_email field to jobs table for contact information
ALTER TABLE public.jobs ADD COLUMN apply_email text;

-- Update job status values to match requirements ('pending', 'live', 'rejected')
-- Create index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_apply_email ON public.jobs(apply_email);

-- Add comment for documentation
COMMENT ON COLUMN public.jobs.apply_email IS 'Contact email for job applications, extracted from CSV email column';

-- Ensure resumes storage bucket exists for CV tailoring
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for resumes bucket (user can only access their own files)
CREATE POLICY "Users can upload their own resumes" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own resumes" ON storage.objects
FOR SELECT USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own resumes" ON storage.objects
FOR UPDATE USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own resumes" ON storage.objects
FOR DELETE USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update admin job creation function to handle apply_email
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
  -- Only allow admin users to call this function
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Set application_value to apply_email if external application and no value provided
  IF job_application_type = 'external' AND job_application_value IS NULL AND job_apply_email IS NOT NULL THEN
    job_application_value := job_apply_email;
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
    apply_email,
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
    job_apply_email,
    COALESCE(job_employer_id, auth.uid()),
    job_sponsored
  )
  RETURNING id INTO new_job_id;

  RETURN new_job_id;
END;
$$;