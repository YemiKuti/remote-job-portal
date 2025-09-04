-- Create a function to reset admin password (admin use only)
CREATE OR REPLACE FUNCTION public.reset_admin_password(target_email text, new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Only allow if called by an admin user or if no admins exist yet
  IF NOT (public.is_current_user_admin() OR NOT EXISTS(SELECT 1 FROM public.user_roles WHERE role = 'admin')) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Check if the target user exists and is an admin
  SELECT au.id, ur.role INTO user_record
  FROM auth.users au
  LEFT JOIN public.user_roles ur ON au.id = ur.user_id
  WHERE au.email = target_email AND ur.role = 'admin';
  
  IF user_record.id IS NULL THEN
    RAISE EXCEPTION 'Admin user not found with email: %', target_email;
  END IF;
  
  -- Note: This function creates a framework, but actual password reset
  -- would need to be done via Supabase Admin API
  -- For now, we'll log the request
  RAISE NOTICE 'Password reset requested for admin user: %', target_email;
  
  RETURN true;
END;
$$;