
-- Add RLS policies for posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all posts
CREATE POLICY "Admins can view all posts" ON public.posts
FOR SELECT 
USING (public.is_current_user_admin());

-- Allow admins to insert posts
CREATE POLICY "Admins can create posts" ON public.posts
FOR INSERT 
WITH CHECK (public.is_current_user_admin());

-- Allow admins to update posts
CREATE POLICY "Admins can update posts" ON public.posts
FOR UPDATE 
USING (public.is_current_user_admin());

-- Allow admins to delete posts
CREATE POLICY "Admins can delete posts" ON public.posts
FOR DELETE 
USING (public.is_current_user_admin());

-- Allow users to view published posts
CREATE POLICY "Users can view published posts" ON public.posts
FOR SELECT 
USING (is_published = true);

-- Create categories table
CREATE TABLE public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tags table
CREATE TABLE public.blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create post-category relationship table
CREATE TABLE public.post_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(post_id, category_id)
);

-- Create post-tag relationship table
CREATE TABLE public.post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.blog_tags(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(post_id, tag_id)
);

-- Add slug, excerpt, and featured_image to posts table
ALTER TABLE public.posts 
ADD COLUMN slug TEXT,
ADD COLUMN excerpt TEXT,
ADD COLUMN featured_image TEXT,
ADD COLUMN meta_title TEXT,
ADD COLUMN meta_description TEXT,
ADD COLUMN view_count INTEGER DEFAULT 0,
ADD COLUMN reading_time INTEGER DEFAULT 0;

-- Create unique index on slug
CREATE UNIQUE INDEX idx_posts_slug ON public.posts(slug) WHERE slug IS NOT NULL;

-- Enable RLS on new tables
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for categories (public read, admin write)
CREATE POLICY "Anyone can view categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.blog_categories FOR ALL USING (public.is_current_user_admin());

-- RLS policies for tags (public read, admin write)
CREATE POLICY "Anyone can view tags" ON public.blog_tags FOR SELECT USING (true);
CREATE POLICY "Admins can manage tags" ON public.blog_tags FOR ALL USING (public.is_current_user_admin());

-- RLS policies for post relationships (public read, admin write)
CREATE POLICY "Anyone can view post categories" ON public.post_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage post categories" ON public.post_categories FOR ALL USING (public.is_current_user_admin());

CREATE POLICY "Anyone can view post tags" ON public.post_tags FOR SELECT USING (true);
CREATE POLICY "Admins can manage post tags" ON public.post_tags FOR ALL USING (public.is_current_user_admin());

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true);

-- Storage policies for blog images
CREATE POLICY "Anyone can view blog images" ON storage.objects 
FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can upload blog images" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND public.is_current_user_admin());

CREATE POLICY "Admins can update blog images" ON storage.objects 
FOR UPDATE USING (bucket_id = 'blog-images' AND public.is_current_user_admin());

CREATE POLICY "Admins can delete blog images" ON storage.objects 
FOR DELETE USING (bucket_id = 'blog-images' AND public.is_current_user_admin());

-- Insert default categories
INSERT INTO public.blog_categories (name, slug, description, color) VALUES
('Technology', 'technology', 'Articles about technology trends and innovations', '#3B82F6'),
('Career', 'career', 'Career advice and job market insights', '#10B981'),
('Industry News', 'industry-news', 'Latest news from the job industry', '#F59E0B'),
('Tips & Guides', 'tips-guides', 'Helpful tips and step-by-step guides', '#8B5CF6');

-- Insert default tags
INSERT INTO public.blog_tags (name, slug) VALUES
('Remote Work', 'remote-work'),
('Interview Tips', 'interview-tips'),
('Resume Writing', 'resume-writing'),
('Job Search', 'job-search'),
('Networking', 'networking'),
('Salary Negotiation', 'salary-negotiation'),
('Programming', 'programming'),
('Data Science', 'data-science'),
('Design', 'design'),
('Marketing', 'marketing');

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$;

-- Function to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION public.auto_generate_post_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Only generate slug if it's null or empty
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := public.generate_slug(NEW.title);
    final_slug := base_slug;
    
    -- Check for uniqueness and append number if needed
    WHILE EXISTS (SELECT 1 FROM public.posts WHERE slug = final_slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  -- Update reading time estimate (average 200 words per minute)
  IF NEW.content IS NOT NULL THEN
    NEW.reading_time := GREATEST(1, (array_length(string_to_array(NEW.content, ' '), 1) / 200.0)::INTEGER);
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Create trigger for auto-generating slug
CREATE TRIGGER auto_generate_post_slug_trigger
  BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_generate_post_slug();
