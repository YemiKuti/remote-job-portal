
-- Insert admin role for the specific user
INSERT INTO public.user_roles (user_id, role)
VALUES ('b4f5e7fb-c816-46a4-92fc-ec418f016575', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;

-- Update the user's metadata to include admin role
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE id = 'b4f5e7fb-c816-46a4-92fc-ec418f016575';

-- Ensure the user has a profile (create or update)
INSERT INTO public.profiles (id, username, full_name, avatar_url)
VALUES (
  'b4f5e7fb-c816-46a4-92fc-ec418f016575',
  'admin_patrick',
  'Patrick Admin',
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name;
