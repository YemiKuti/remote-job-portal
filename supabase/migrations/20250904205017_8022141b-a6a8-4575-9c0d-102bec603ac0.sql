-- Further restrict the public policy to prevent any direct access to sensitive fields
-- Drop the current public policy
DROP POLICY IF EXISTS "Public can view basic profile info only" ON public.profiles;

-- Create a more restrictive policy that denies direct table access to non-owners
-- Public users must now use the get_public_profile_info() function instead
CREATE POLICY "No public direct access to profiles table" 
ON public.profiles 
FOR SELECT 
USING (false); -- Deny all direct access for non-owners

-- The other policies remain unchanged:
-- 1. "Users can view their own complete profile" - allows users to see their own data
-- 2. "Admins can view all profiles" - allows admin access
-- 3. get_public_profile_info() function provides safe public access