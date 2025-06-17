
-- Create storage bucket for tailored resumes if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tailored-resumes',
  'tailored-resumes',
  false,
  5242880, -- 5MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for tailored-resumes bucket
DO $$ 
BEGIN
    -- Drop existing policies if they exist and recreate them
    DROP POLICY IF EXISTS "Users can upload their own tailored resumes" ON storage.objects;
    DROP POLICY IF EXISTS "Users can view their own tailored resumes" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own tailored resumes" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own tailored resumes" ON storage.objects;

    CREATE POLICY "Users can upload their own tailored resumes" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'tailored-resumes' AND 
      auth.uid()::text = (storage.foldername(name))[1]
    );

    CREATE POLICY "Users can view their own tailored resumes" ON storage.objects
    FOR SELECT USING (
      bucket_id = 'tailored-resumes' AND 
      auth.uid()::text = (storage.foldername(name))[1]
    );

    CREATE POLICY "Users can update their own tailored resumes" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'tailored-resumes' AND 
      auth.uid()::text = (storage.foldername(name))[1]
    );

    CREATE POLICY "Users can delete their own tailored resumes" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'tailored-resumes' AND 
      auth.uid()::text = (storage.foldername(name))[1]
    );
END $$;

-- Add columns to tailored_resumes table for the new workflow
ALTER TABLE tailored_resumes 
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS job_description TEXT,
ADD COLUMN IF NOT EXISTS tailored_file_path TEXT,
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS file_format TEXT DEFAULT 'pdf';

-- Add RLS policies for tailored_resumes table
ALTER TABLE tailored_resumes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Drop existing policies if they exist and recreate them
    DROP POLICY IF EXISTS "Users can view their own tailored resumes" ON tailored_resumes;
    DROP POLICY IF EXISTS "Users can insert their own tailored resumes" ON tailored_resumes;
    DROP POLICY IF EXISTS "Users can update their own tailored resumes" ON tailored_resumes;
    DROP POLICY IF EXISTS "Users can delete their own tailored resumes" ON tailored_resumes;

    CREATE POLICY "Users can view their own tailored resumes" ON tailored_resumes
    FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own tailored resumes" ON tailored_resumes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own tailored resumes" ON tailored_resumes
    FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own tailored resumes" ON tailored_resumes
    FOR DELETE USING (auth.uid() = user_id);
END $$;

-- Add RLS policies for candidate_resumes table
ALTER TABLE candidate_resumes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Drop existing policies if they exist and recreate them
    DROP POLICY IF EXISTS "Users can view their own resumes" ON candidate_resumes;
    DROP POLICY IF EXISTS "Users can insert their own resumes" ON candidate_resumes;
    DROP POLICY IF EXISTS "Users can update their own resumes" ON candidate_resumes;
    DROP POLICY IF EXISTS "Users can delete their own resumes" ON candidate_resumes;

    CREATE POLICY "Users can view their own resumes" ON candidate_resumes
    FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own resumes" ON candidate_resumes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own resumes" ON candidate_resumes
    FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own resumes" ON candidate_resumes
    FOR DELETE USING (auth.uid() = user_id);
END $$;
