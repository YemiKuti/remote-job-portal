
-- Grant admin role to yemikuti@gmail.com user
INSERT INTO public.user_roles (user_id, role, created_at)
VALUES (
  '29f363d0-fed8-465a-a545-345dfa381039'::uuid,
  'admin'::app_role,
  now()
) ON CONFLICT (user_id, role) DO NOTHING;

-- Update the profile information for better identification (use a unique username)
UPDATE public.profiles 
SET 
  username = 'yemikuti_admin',
  full_name = 'Yemi Admin',
  updated_at = now()
WHERE id = '29f363d0-fed8-465a-a545-345dfa381039'::uuid;

-- Verify the admin role assignment
SELECT 
  p.id,
  p.username,
  p.full_name,
  ur.role,
  au.email,
  au.email_confirmed_at
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.id = '29f363d0-fed8-465a-a545-345dfa381039'::uuid;
