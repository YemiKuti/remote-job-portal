-- Step 1: Insert the 5 required sample jobs
INSERT INTO public.jobs (
  title, company, location, description, requirements, employment_type, 
  experience_level, status, application_type, application_value, sponsored
) VALUES 
(
  'Senior React Developer',
  'Tech Innovations Inc',
  'San Francisco, CA',
  'We are seeking a talented Senior React Developer to join our dynamic team. You will be responsible for developing cutting-edge web applications using React, TypeScript, and modern frontend technologies.',
  ARRAY['React', 'TypeScript', 'JavaScript', '5+ years experience', 'Redux/Context API'],
  'full-time',
  'senior',
  'active',
  'email',
  'careers@techinnovations.com',
  true
),
(
  'Marketing Manager',
  'Digital Marketing Solutions',
  'New York, NY', 
  'Join our marketing team to lead digital campaigns and drive customer engagement. This role requires creativity, analytical skills, and experience with modern marketing tools.',
  ARRAY['Marketing degree', '3+ years experience', 'Google Analytics', 'Social Media Management'],
  'full-time',
  'mid',
  'active',
  'external',
  'https://digitalmarketing.com/careers/marketing-manager',
  true
),
(
  'Data Analyst',
  'DataCore Analytics',
  'Chicago, IL',
  'We are looking for a detail-oriented Data Analyst to help us make data-driven decisions. You will work with large datasets and create insightful reports for stakeholders.',
  ARRAY['SQL', 'Python/R', 'Excel', 'Statistics', '2+ years experience'],
  'full-time',
  'mid',
  'active',
  'email',
  'hr@datacore.com',
  true
),
(
  'Product Manager',
  'InnovateTech',
  'Austin, TX',
  'Lead product strategy and development for our flagship SaaS platform. Work cross-functionally with engineering, design, and sales teams to deliver exceptional user experiences.',
  ARRAY['Product Management', 'Agile/Scrum', 'User Research', 'Analytics', '4+ years experience'],
  'full-time',
  'senior',
  'active',
  'external',
  'https://innovatetech.io/jobs/product-manager',
  true
),
(
  'UX Designer',
  'Creative Studio Pro',
  'Los Angeles, CA',
  'Create intuitive and beautiful user experiences for web and mobile applications. Collaborate with product teams to design user-centered solutions that drive business results.',
  ARRAY['UI/UX Design', 'Figma/Sketch', 'User Research', 'Prototyping', '3+ years experience'],
  'full-time',
  'mid',
  'active',
  'email',
  'design@creativestudio.com',
  true
);

-- Step 2: Fix existing mis-mapped application types
-- Fix jobs that have application_type='email' but contain URLs
UPDATE public.jobs 
SET 
  application_type = 'external',
  updated_at = now()
WHERE application_type = 'email' 
  AND application_value ~ '^https?://';

-- Fix jobs that have application_type='email' but invalid email format
UPDATE public.jobs 
SET 
  application_type = 'internal',
  application_value = NULL,
  updated_at = now()
WHERE application_type = 'email' 
  AND application_value IS NOT NULL
  AND NOT (application_value ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$');

-- Step 3: Ensure all external type jobs have valid URLs
UPDATE public.jobs 
SET 
  application_type = 'internal',
  application_value = NULL,
  updated_at = now()
WHERE application_type = 'external'
  AND (application_value IS NULL OR NOT (application_value ~ '^https?://'));