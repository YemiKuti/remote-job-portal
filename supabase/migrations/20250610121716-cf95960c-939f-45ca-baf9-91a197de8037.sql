
-- First, let's check if the user already has admin role, and if not, add it
-- This approach avoids conflicts with existing users

-- Add admin role to the existing user (ignore if already exists)
INSERT INTO public.user_roles (user_id, role)
SELECT 
  id,
  'admin'::app_role
FROM auth.users 
WHERE email = 'patrickdjeck18@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Update the user's metadata to include admin role
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'patrickdjeck18@gmail.com';

-- Ensure the user has a profile (update or insert)
INSERT INTO public.profiles (id, username, full_name, avatar_url)
SELECT 
  id,
  'admin_patrick',
  'Patrick Admin',
  NULL
FROM auth.users 
WHERE email = 'patrickdjeck18@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name;
