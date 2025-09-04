-- Create admin user for yemikuti@gmail.com
-- This uses Supabase's admin functions to create the user with the specified credentials

-- First, insert the user into auth.users using the admin API functions
-- Note: In a real migration, this would typically be done via the admin API
-- For now, we'll create the profile and role, and the user will need to be created via the admin dashboard

-- Create profile for the admin user (assuming the auth user will be created separately)
-- We'll use a known UUID for this admin user
DO $$
DECLARE
    admin_user_id UUID := '550e8400-e29b-41d4-a716-446655440000';
BEGIN
    -- Insert profile for admin user
    INSERT INTO public.profiles (id, username, full_name, created_at)
    VALUES (
        admin_user_id,
        'admin',
        'System Administrator', 
        now()
    ) ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        full_name = EXCLUDED.full_name,
        updated_at = now();

    -- Assign admin role
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (admin_user_id, 'admin'::app_role, now())
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'Admin user profile and role created. Auth user must be created via Supabase admin dashboard with email: yemikuti@gmail.com';
END $$;