
-- Add missing columns to candidate_resumes table
ALTER TABLE public.candidate_resumes 
ADD COLUMN IF NOT EXISTS candidate_data JSONB,
ADD COLUMN IF NOT EXISTS extracted_content TEXT;

-- Create an index on candidate_data for better performance
CREATE INDEX IF NOT EXISTS idx_candidate_resumes_candidate_data 
ON public.candidate_resumes USING GIN (candidate_data);
