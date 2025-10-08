-- Fix remaining admin and helper functions

CREATE OR REPLACE FUNCTION public.get_admin_jobs()
RETURNS TABLE(
  id uuid, title text, company text, location text, created_at timestamp with time zone,
  status text, applications integer, description text, requirements text[],
  salary_min integer, salary_max integer, employment_type text, experience_level text,
  tech_stack text[], employer_id uuid, is_featured boolean, views integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT j.id, j.title, j.company, j.location, j.created_at, j.status, j.applications,
         j.description, j.requirements, j.salary_min, j.salary_max, j.employment_type,
         j.experience_level, j.tech_stack, j.employer_id, j.is_featured, j.views
  FROM public.jobs j
  WHERE public.is_current_user_admin() = true
  ORDER BY j.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_job_status(job_id uuid, new_status text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.jobs 
  SET status = new_status, updated_at = now()
  WHERE id = job_id AND public.is_current_user_admin() = true;
  
  SELECT public.is_current_user_admin();
$$;

CREATE OR REPLACE FUNCTION public.get_admin_companies()
RETURNS TABLE(
  id uuid, name text, description text, industry text, website text,
  logo_url text, location text, company_size text, founded_year integer,
  email text, phone text, linkedin_url text, twitter_url text, status text,
  created_at timestamp with time zone, updated_at timestamp with time zone, created_by uuid
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.name, c.description, c.industry, c.website, c.logo_url,
         c.location, c.company_size, c.founded_year, c.email, c.phone,
         c.linkedin_url, c.twitter_url, c.status, c.created_at, c.updated_at, c.created_by
  FROM public.companies c
  WHERE public.is_current_user_admin() = true
  ORDER BY c.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.admin_create_company(
  company_name text,
  company_description text DEFAULT NULL,
  company_industry text DEFAULT NULL,
  company_website text DEFAULT NULL,
  company_logo_url text DEFAULT NULL,
  company_location text DEFAULT NULL,
  company_size text DEFAULT NULL,
  company_founded_year integer DEFAULT NULL,
  company_email text DEFAULT NULL,
  company_phone text DEFAULT NULL,
  company_linkedin_url text DEFAULT NULL,
  company_twitter_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO public.companies (
    name, description, industry, website, logo_url, location,
    company_size, founded_year, email, phone, linkedin_url, twitter_url, created_by
  )
  SELECT company_name, company_description, company_industry, company_website,
         company_logo_url, company_location, company_size, company_founded_year,
         company_email, company_phone, company_linkedin_url, company_twitter_url, auth.uid()
  WHERE public.is_current_user_admin() = true
  RETURNING id;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_company(
  company_id uuid,
  company_name text,
  company_description text DEFAULT NULL,
  company_industry text DEFAULT NULL,
  company_website text DEFAULT NULL,
  company_logo_url text DEFAULT NULL,
  company_location text DEFAULT NULL,
  company_size text DEFAULT NULL,
  company_founded_year integer DEFAULT NULL,
  company_email text DEFAULT NULL,
  company_phone text DEFAULT NULL,
  company_linkedin_url text DEFAULT NULL,
  company_twitter_url text DEFAULT NULL,
  company_status text DEFAULT 'active'
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.companies 
  SET 
    name = company_name,
    description = company_description,
    industry = company_industry,
    website = company_website,
    logo_url = company_logo_url,
    location = company_location,
    company_size = company_size,
    founded_year = company_founded_year,
    email = company_email,
    phone = company_phone,
    linkedin_url = company_linkedin_url,
    twitter_url = company_twitter_url,
    status = company_status,
    updated_at = now()
  WHERE id = company_id AND public.is_current_user_admin() = true;
  
  SELECT public.is_current_user_admin();
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_company(company_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.companies 
  WHERE id = company_id AND public.is_current_user_admin() = true;
  
  SELECT public.is_current_user_admin();
$$;

CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE(
  id uuid, email text, username text, full_name text, avatar_url text,
  role text, status text, created_at timestamp with time zone,
  last_sign_in_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

CREATE OR REPLACE FUNCTION public.admin_update_user_role(target_user_id uuid, new_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  IF new_role NOT IN ('admin', 'employer', 'candidate', 'user') THEN
    RAISE EXCEPTION 'Invalid role. Must be admin, employer, candidate, or user.';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = target_user_id;

  IF new_role != 'user' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, new_role::app_role);
  END IF;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account.';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  DELETE FROM public.profiles WHERE id = target_user_id;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username', 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  
  user_role := new.raw_user_meta_data->>'role';
  
  IF user_role IN ('candidate', 'employer') THEN
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (new.id, user_role::public.app_role, now())
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (new.id, 'candidate'::public.app_role, now())
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$;