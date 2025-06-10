
-- Create admin function to get complete user data including emails and roles
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE(
  id uuid,
  email text,
  username text,
  full_name text,
  avatar_url text,
  role text,
  status text,
  created_at timestamp with time zone,
  last_sign_in_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admin users to call this function
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    COALESCE(au.email, 'No email available') as email,
    p.username,
    p.full_name,
    p.avatar_url,
    COALESCE(ur.role::text, 'user') as role,
    CASE 
      WHEN au.email_confirmed_at IS NOT NULL THEN 'active'
      ELSE 'pending'
    END as status,
    p.created_at,
    au.last_sign_in_at
  FROM public.profiles p
  LEFT JOIN auth.users au ON p.id = au.id
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  ORDER BY p.created_at DESC;
END;
$$;

-- Create admin function to create new users
CREATE OR REPLACE FUNCTION public.admin_create_user(
  user_email text,
  user_password text,
  user_full_name text DEFAULT NULL,
  user_username text DEFAULT NULL,
  user_role text DEFAULT 'user'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
  new_user_data jsonb;
BEGIN
  -- Only allow admin users to call this function
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Validate role
  IF user_role NOT IN ('admin', 'employer', 'candidate', 'user') THEN
    RAISE EXCEPTION 'Invalid role. Must be admin, employer, candidate, or user.';
  END IF;

  -- Create the user in auth.users via admin API
  -- Note: This requires the admin to have proper service role permissions
  SELECT auth.uid() INTO new_user_id; -- This is a placeholder - actual implementation would use Supabase Admin API
  
  -- For now, we'll create a more basic approach that works with RLS
  -- Insert into profiles table (this will need to be coordinated with actual user creation)
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (gen_random_uuid(), user_username, user_full_name)
  RETURNING id INTO new_user_id;

  -- Assign role if not default 'user'
  IF user_role != 'user' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, user_role::app_role);
  END IF;

  RETURN new_user_id;
END;
$$;

-- Create admin function to update user role
CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  target_user_id uuid,
  new_role text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admin users to call this function
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Validate role
  IF new_role NOT IN ('admin', 'employer', 'candidate', 'user') THEN
    RAISE EXCEPTION 'Invalid role. Must be admin, employer, candidate, or user.';
  END IF;

  -- Remove existing role
  DELETE FROM public.user_roles WHERE user_id = target_user_id;

  -- Add new role if not default 'user'
  IF new_role != 'user' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, new_role::app_role);
  END IF;

  RETURN true;
END;
$$;

-- Create admin function to delete user
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admin users to call this function
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Don't allow deleting yourself
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account.';
  END IF;

  -- Delete user roles
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  -- Delete profile
  DELETE FROM public.profiles WHERE id = target_user_id;

  -- Note: Actual user deletion from auth.users would need to be handled 
  -- via Supabase Admin API or separate process

  RETURN true;
END;
$$;
