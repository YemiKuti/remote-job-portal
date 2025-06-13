

-- Create admin user directly in the database
-- Note: This creates the database records, but the actual auth user needs to be created via Supabase Admin API
-- For now, we'll ensure the profile and role are ready when the user signs up

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

-- Create the auth user directly (this requires service role access)
-- This will create the user with the specified email and password
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  'e30cbe1d-aad2-46c1-b4d2-ce9969b83f06'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'yemikuti@gmail.com',
  crypt('@1Arsenalfan#', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin User", "role": "admin"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = now();

-- Create identity record for email auth
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  created_at,
  updated_at
)
VALUES (
  'e30cbe1d-aad2-46c1-b4d2-ce9969b83f06'::uuid,
  'e30cbe1d-aad2-46c1-b4d2-ce9969b83f06'::uuid,
  'e30cbe1d-aad2-46c1-b4d2-ce9969b83f06'::uuid,
  jsonb_build_object('sub', 'e30cbe1d-aad2-46c1-b4d2-ce9969b83f06', 'email', 'yemikuti@gmail.com'),
  'email',
  now(),
  now()
) ON CONFLICT (provider, provider_id) DO UPDATE SET
  updated_at = now();

-- Verify the complete setup
SELECT 
  p.id,
  p.username,
  p.full_name,
  ur.role,
  u.email,
  u.email_confirmed_at
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.id = 'e30cbe1d-aad2-46c1-b4d2-ce9969b83f06'::uuid;

