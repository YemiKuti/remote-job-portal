
-- Create table for storing tailored resume versions
CREATE TABLE public.tailored_resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_resume_id UUID REFERENCES public.candidate_resumes(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  tailored_content TEXT NOT NULL,
  ai_suggestions JSONB,
  accepted_suggestions JSONB,
  tailoring_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for tracking CV tailoring sessions
CREATE TABLE public.cv_tailoring_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  original_resume_id UUID REFERENCES public.candidate_resumes(id) ON DELETE CASCADE,
  session_data JSONB,
  status TEXT NOT NULL DEFAULT 'in_progress',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.tailored_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_tailoring_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tailored_resumes
CREATE POLICY "Users can view their own tailored resumes" 
  ON public.tailored_resumes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tailored resumes" 
  ON public.tailored_resumes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tailored resumes" 
  ON public.tailored_resumes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tailored resumes" 
  ON public.tailored_resumes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for cv_tailoring_sessions
CREATE POLICY "Users can view their own tailoring sessions" 
  ON public.cv_tailoring_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tailoring sessions" 
  ON public.cv_tailoring_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tailoring sessions" 
  ON public.cv_tailoring_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tailoring sessions" 
  ON public.cv_tailoring_sessions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_tailored_resumes_user_id ON public.tailored_resumes(user_id);
CREATE INDEX idx_tailored_resumes_job_id ON public.tailored_resumes(job_id);
CREATE INDEX idx_cv_tailoring_sessions_user_id ON public.cv_tailoring_sessions(user_id);
CREATE INDEX idx_cv_tailoring_sessions_job_id ON public.cv_tailoring_sessions(job_id);

-- Update trigger for timestamps
CREATE OR REPLACE FUNCTION update_tailored_resumes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_cv_tailoring_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tailored_resumes_updated_at
  BEFORE UPDATE ON public.tailored_resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_tailored_resumes_updated_at();

CREATE TRIGGER cv_tailoring_sessions_updated_at
  BEFORE UPDATE ON public.cv_tailoring_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_cv_tailoring_sessions_updated_at();
