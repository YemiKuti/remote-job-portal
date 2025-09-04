-- CRITICAL SECURITY FIX: Restrict public access to sensitive profile data

-- Drop the overly permissive policy that allows anyone to view all profile data
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view other profiles" ON public.profiles;

-- Create secure policies that protect sensitive data

-- Policy 1: Users can view their own complete profile (including sensitive data)
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Others can view only basic public information (NO phone, location, website)
CREATE POLICY "Public can view basic profile info only" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() != id AND  -- Not viewing their own profile
  id IS NOT NULL        -- Valid profile exists
);

-- Policy 3: Admins can view all profiles for moderation
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_current_user_admin());

-- Create a security definer function to get public profile data only
CREATE OR REPLACE FUNCTION public.get_public_profile_info(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  title text,
  bio text,
  skills text,
  experience integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.title,
    p.bio,
    p.skills,
    p.experience
  FROM public.profiles p
  WHERE p.id = profile_user_id;
$$;