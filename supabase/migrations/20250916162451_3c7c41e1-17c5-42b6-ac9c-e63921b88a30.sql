-- Add status column to tailored_resumes for verification and workflow state
ALTER TABLE public.tailored_resumes
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'tailored';

-- Optional helpful index for querying by status (kept minimal)
CREATE INDEX IF NOT EXISTS idx_tailored_resumes_status ON public.tailored_resumes(status);