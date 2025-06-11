
-- First, let's drop the existing foreign key constraints that might be causing issues
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS fk_applications_user_id;
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS fk_applications_employer_id;
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS fk_jobs_employer_id;

-- Drop existing RLS policies that might be problematic
DROP POLICY IF EXISTS "Users can view their own applications" ON public.applications;
DROP POLICY IF EXISTS "Employers can view applications to their jobs" ON public.applications;
DROP POLICY IF EXISTS "Users can create applications" ON public.applications;
DROP POLICY IF EXISTS "Employers can update applications to their jobs" ON public.applications;
DROP POLICY IF EXISTS "Everyone can view active jobs" ON public.jobs;
DROP POLICY IF EXISTS "Employers can view their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Employers can create jobs" ON public.jobs;
DROP POLICY IF EXISTS "Employers can update their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view other profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Disable RLS temporarily to avoid conflicts
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Add proper foreign key constraints using profiles table
ALTER TABLE public.applications 
ADD CONSTRAINT fk_applications_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.applications 
ADD CONSTRAINT fk_applications_employer_id 
FOREIGN KEY (employer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.jobs 
ADD CONSTRAINT fk_jobs_employer_id 
FOREIGN KEY (employer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Re-enable RLS with simpler policies
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies for applications
CREATE POLICY "Users can view their own applications" 
ON public.applications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Employers can view applications to their jobs" 
ON public.applications 
FOR SELECT 
USING (auth.uid() = employer_id);

CREATE POLICY "Users can create applications" 
ON public.applications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employers can update application status" 
ON public.applications 
FOR UPDATE 
USING (auth.uid() = employer_id);

-- Create simple RLS policies for jobs
CREATE POLICY "Everyone can view active jobs" 
ON public.jobs 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Employers can view their own jobs" 
ON public.jobs 
FOR SELECT 
USING (auth.uid() = employer_id);

CREATE POLICY "Employers can create jobs" 
ON public.jobs 
FOR INSERT 
WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update their own jobs" 
ON public.jobs 
FOR UPDATE 
USING (auth.uid() = employer_id);

-- Create simple RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can view other profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);
