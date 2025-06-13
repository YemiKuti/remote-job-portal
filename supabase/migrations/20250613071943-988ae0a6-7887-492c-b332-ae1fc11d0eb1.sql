
-- Update existing applications to set employer_id from the jobs table
UPDATE public.applications 
SET employer_id = jobs.employer_id 
FROM public.jobs 
WHERE applications.job_id = jobs.id 
AND applications.employer_id IS NULL;

-- Add a constraint to prevent future null employer_id values
ALTER TABLE public.applications 
ALTER COLUMN employer_id SET NOT NULL;

-- Add an index to improve query performance for employer applications
CREATE INDEX IF NOT EXISTS idx_applications_employer_id 
ON public.applications(employer_id);
