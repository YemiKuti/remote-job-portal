
-- Update the handle_new_user function to automatically assign roles during signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role text;
BEGIN
  -- Insert into profiles table
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
    VALUES (new.id, user_role::app_role, now())
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also assign roles to existing users who don't have them yet
-- This will help fix the current issue where existing users show as 0
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'role', 'candidate')::app_role,
  now()
FROM auth.users au
LEFT JOIN public.user_roles ur ON au.id = ur.user_id
WHERE ur.user_id IS NULL
  AND au.raw_user_meta_data->>'role' IN ('candidate', 'employer')
ON CONFLICT (user_id, role) DO NOTHING;

-- For users without a role in metadata, assign them as candidates by default
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT 
  au.id,
  'candidate'::app_role,
  now()
FROM auth.users au
LEFT JOIN public.user_roles ur ON au.id = ur.user_id
WHERE ur.user_id IS NULL
  AND (au.raw_user_meta_data->>'role' IS NULL OR au.raw_user_meta_data->>'role' NOT IN ('candidate', 'employer', 'admin'))
ON CONFLICT (user_id, role) DO NOTHING;
