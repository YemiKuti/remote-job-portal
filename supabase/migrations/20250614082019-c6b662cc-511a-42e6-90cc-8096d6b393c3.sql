
-- First, let's make sure we drop any existing problematic function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the app_role enum type if it doesn't exist (with better error handling)
DO $$ 
BEGIN
    -- Check if the type already exists
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'employer', 'candidate');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN 
        -- Type already exists, do nothing
        NULL;
END $$;

-- Now create the function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role text;
BEGIN
  -- Insert into profiles table first
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username', 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  
  -- Get the role from user metadata
  user_role := new.raw_user_meta_data->>'role';
  
  -- Only assign candidate or employer roles automatically (not admin for security)
  IF user_role IN ('candidate', 'employer') THEN
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (new.id, user_role::public.app_role, now())
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Default to candidate role if no role specified or invalid role
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (new.id, 'candidate'::public.app_role, now())
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
