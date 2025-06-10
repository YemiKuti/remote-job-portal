
-- Create companies table with comprehensive company information
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  industry TEXT,
  website TEXT,
  logo_url TEXT,
  location TEXT,
  company_size TEXT,
  founded_year INTEGER,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on companies table
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage companies
CREATE POLICY "Admins can manage companies" 
  ON public.companies 
  FOR ALL 
  USING (public.is_current_user_admin() = true);

-- Create policy for authenticated users to view active companies
CREATE POLICY "Users can view active companies" 
  ON public.companies 
  FOR SELECT 
  USING (status = 'active');

-- Create admin function to get all companies
CREATE OR REPLACE FUNCTION public.get_admin_companies()
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  industry text,
  website text,
  logo_url text,
  location text,
  company_size text,
  founded_year integer,
  email text,
  phone text,
  linkedin_url text,
  twitter_url text,
  status text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  created_by uuid
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

-- Create admin function to create company
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

-- Create admin function to update company
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

-- Create admin function to delete company
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
