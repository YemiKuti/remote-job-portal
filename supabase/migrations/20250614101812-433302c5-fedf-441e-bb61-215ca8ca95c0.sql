
-- First, clean up any saved_jobs that reference non-existent jobs
DELETE FROM public.saved_jobs 
WHERE job_id NOT IN (SELECT id FROM public.jobs);

-- Clean up any applications that reference non-existent jobs
DELETE FROM public.applications 
WHERE job_id NOT IN (SELECT id FROM public.jobs);

-- Clean up any tailored_resumes that reference non-existent jobs
DELETE FROM public.tailored_resumes 
WHERE job_id IS NOT NULL AND job_id NOT IN (SELECT id FROM public.jobs);

-- Clean up any cv_tailoring_sessions that reference non-existent jobs
DELETE FROM public.cv_tailoring_sessions 
WHERE job_id NOT IN (SELECT id FROM public.jobs);

-- Clean up any tailored_resumes that reference non-existent candidate_resumes
DELETE FROM public.tailored_resumes 
WHERE original_resume_id IS NOT NULL AND original_resume_id NOT IN (SELECT id FROM public.candidate_resumes);

-- Clean up any cv_tailoring_sessions that reference non-existent candidate_resumes
DELETE FROM public.cv_tailoring_sessions 
WHERE original_resume_id IS NOT NULL AND original_resume_id NOT IN (SELECT id FROM public.candidate_resumes);

-- Add foreign key constraints only if they don't exist
DO $$ 
BEGIN
    -- Add saved_jobs foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_saved_jobs_job_id'
    ) THEN
        ALTER TABLE public.saved_jobs 
        ADD CONSTRAINT fk_saved_jobs_job_id 
        FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
    END IF;

    -- Add tailored_resumes job_id foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_tailored_resumes_job_id'
    ) THEN
        ALTER TABLE public.tailored_resumes 
        ADD CONSTRAINT fk_tailored_resumes_job_id 
        FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
    END IF;

    -- Add tailored_resumes original_resume_id foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_tailored_resumes_original_resume_id'
    ) THEN
        ALTER TABLE public.tailored_resumes 
        ADD CONSTRAINT fk_tailored_resumes_original_resume_id 
        FOREIGN KEY (original_resume_id) REFERENCES public.candidate_resumes(id) ON DELETE SET NULL;
    END IF;

    -- Add cv_tailoring_sessions job_id foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_cv_tailoring_sessions_job_id'
    ) THEN
        ALTER TABLE public.cv_tailoring_sessions 
        ADD CONSTRAINT fk_cv_tailoring_sessions_job_id 
        FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;
    END IF;

    -- Add cv_tailoring_sessions original_resume_id foreign key if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_cv_tailoring_sessions_original_resume_id'
    ) THEN
        ALTER TABLE public.cv_tailoring_sessions 
        ADD CONSTRAINT fk_cv_tailoring_sessions_original_resume_id 
        FOREIGN KEY (original_resume_id) REFERENCES public.candidate_resumes(id) ON DELETE SET NULL;
    END IF;
END $$;
