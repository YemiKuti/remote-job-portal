
-- Drop the problematic RLS policies that reference auth.users directly
DROP POLICY IF EXISTS "Admins can delete all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can update all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can view all jobs" ON public.jobs;

-- Drop any other potentially problematic policies that might reference auth.users
DROP POLICY IF EXISTS "Admin can view all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admin can update all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admin can delete all jobs" ON public.jobs;

-- Keep only the safe policies that use auth.uid() or security definer functions
-- These should already exist, but let's ensure they're properly defined

-- Policy for employers to view their own jobs
DROP POLICY IF EXISTS "Employers can view their own jobs" ON public.jobs;
CREATE POLICY "Employers can view their own jobs" 
ON public.jobs 
FOR SELECT 
USING (auth.uid() = employer_id);

-- Policy for everyone to view active jobs
DROP POLICY IF EXISTS "Everyone can view active jobs" ON public.jobs;
CREATE POLICY "Everyone can view active jobs" 
ON public.jobs 
FOR SELECT 
USING (status = 'active');

-- Policy for employers to create jobs
DROP POLICY IF EXISTS "Employers can create jobs" ON public.jobs;
CREATE POLICY "Employers can create jobs" 
ON public.jobs 
FOR INSERT 
WITH CHECK (auth.uid() = employer_id);

-- Policy for employers to update their own jobs
DROP POLICY IF EXISTS "Employers can update their own jobs" ON public.jobs;
CREATE POLICY "Employers can update their own jobs" 
ON public.jobs 
FOR UPDATE 
USING (auth.uid() = employer_id);

-- Policy for employers to delete their own jobs
DROP POLICY IF EXISTS "Employers can delete their own jobs" ON public.jobs;
CREATE POLICY "Employers can delete their own jobs" 
ON public.jobs 
FOR DELETE 
USING (auth.uid() = employer_id);

-- Admin policies using the security definer function (safe)
DROP POLICY IF EXISTS "Admins can manage all jobs" ON public.jobs;
CREATE POLICY "Admins can manage all jobs" 
ON public.jobs 
FOR ALL 
USING (public.is_current_user_admin() = true);
