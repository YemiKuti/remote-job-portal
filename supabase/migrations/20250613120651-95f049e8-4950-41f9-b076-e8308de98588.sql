
-- Create admin user directly in the database
-- First, we'll create a profile entry for the admin user
INSERT INTO public.profiles (id, username, full_name, created_at, updated_at)
VALUES (
  'e30cbe1d-aad2-46c1-b4d2-ce9969b83f06'::uuid,
  'yemikuti',
  'Admin User',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  updated_at = now();

-- Assign admin role to the user
INSERT INTO public.user_roles (user_id, role, created_at)
VALUES (
  'e30cbe1d-aad2-46c1-b4d2-ce9969b83f06'::uuid,
  'admin'::app_role,
  now()
) ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the admin role assignment
SELECT 
  p.id,
  p.username,
  p.full_name,
  ur.role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
WHERE p.id = 'e30cbe1d-aad2-46c1-b4d2-ce9969b83f06'::uuid;
