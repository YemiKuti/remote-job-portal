
-- Fix the is_current_user_admin function to properly detect admin roles
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  );
$$;

-- Fix the get_admin_users function with proper type casting
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
    COALESCE(au.email::text, 'No email available') as email,
    COALESCE(p.username::text, '') as username,
    COALESCE(p.full_name::text, '') as full_name,
    COALESCE(p.avatar_url::text, '') as avatar_url,
    COALESCE(ur.role::text, 'user') as role,
    CASE 
      WHEN au.email_confirmed_at IS NOT NULL THEN 'active'::text
      ELSE 'pending'::text
    END as status,
    COALESCE(p.created_at, now()) as created_at,
    au.last_sign_in_at
  FROM public.profiles p
  LEFT JOIN auth.users au ON p.id = au.id
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  ORDER BY COALESCE(p.created_at, now()) DESC;
END;
$$;

-- Add function to get current user authentication status for debugging
CREATE OR REPLACE FUNCTION public.get_current_user_auth_status()
RETURNS TABLE(
  user_id uuid,
  is_authenticated boolean,
  is_admin boolean,
  email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.uid() as user_id,
    (auth.uid() IS NOT NULL) as is_authenticated,
    public.is_current_user_admin() as is_admin,
    COALESCE((
      SELECT au.email::text 
      FROM auth.users au 
      WHERE au.id = auth.uid()
    ), 'No email') as email;
END;
$$;
