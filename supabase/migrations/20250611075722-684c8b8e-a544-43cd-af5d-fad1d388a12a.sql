
-- Add foreign key constraints to fix the relationship issues

-- Add foreign key from applications.job_id to jobs.id
ALTER TABLE public.applications 
ADD CONSTRAINT fk_applications_job_id 
FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

-- Add foreign key from applications.user_id to profiles.id
ALTER TABLE public.applications 
ADD CONSTRAINT fk_applications_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key from applications.employer_id to profiles.id
ALTER TABLE public.applications 
ADD CONSTRAINT fk_applications_employer_id 
FOREIGN KEY (employer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
