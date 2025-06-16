
-- First, let's identify and remove duplicate applications, keeping only the earliest one for each user-job combination
WITH duplicate_applications AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY user_id, job_id ORDER BY applied_date ASC) as rn
  FROM public.applications
)
DELETE FROM public.applications 
WHERE id IN (
  SELECT id FROM duplicate_applications WHERE rn > 1
);

-- Now add the unique constraint to prevent future duplicates
ALTER TABLE public.applications 
ADD CONSTRAINT applications_user_job_unique 
UNIQUE (user_id, job_id);

-- Add an index for better performance on application checks
CREATE INDEX IF NOT EXISTS idx_applications_user_job 
ON public.applications (user_id, job_id);
