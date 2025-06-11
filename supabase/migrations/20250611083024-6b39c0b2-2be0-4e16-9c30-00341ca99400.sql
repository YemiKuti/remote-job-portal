
-- Check if there are any remaining problematic foreign key constraints
-- and drop them to ensure we're only referencing the profiles table

-- Drop any remaining foreign key constraints that might reference auth.users
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_user_id_fkey;
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS applications_employer_id_fkey;
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_employer_id_fkey;

-- Also drop the constraint we just added in case it's causing issues
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS fk_applications_user_id;
ALTER TABLE public.applications DROP CONSTRAINT IF EXISTS fk_applications_employer_id;
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS fk_jobs_employer_id;

-- Ensure profiles table has proper structure and constraint
-- Make sure the profiles.id is properly set up to reference auth.users(id)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Now add back the foreign key constraints but referencing profiles
ALTER TABLE public.applications 
ADD CONSTRAINT fk_applications_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.applications 
ADD CONSTRAINT fk_applications_employer_id 
FOREIGN KEY (employer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.jobs 
ADD CONSTRAINT fk_jobs_employer_id 
FOREIGN KEY (employer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Make sure we have a trigger to create profiles for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username', 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
