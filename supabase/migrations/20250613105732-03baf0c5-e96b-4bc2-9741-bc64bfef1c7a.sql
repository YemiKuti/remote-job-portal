
-- Add missing fields to applications table for document support
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS cover_letter text,
ADD COLUMN IF NOT EXISTS resume_id uuid REFERENCES public.candidate_resumes(id),
ADD COLUMN IF NOT EXISTS portfolio_url text,
ADD COLUMN IF NOT EXISTS additional_notes text;

-- Create index for better performance when joining with resumes
CREATE INDEX IF NOT EXISTS idx_applications_resume_id ON public.applications(resume_id);

-- Add better indexing for employer applications queries
CREATE INDEX IF NOT EXISTS idx_applications_employer_id ON public.applications(employer_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
