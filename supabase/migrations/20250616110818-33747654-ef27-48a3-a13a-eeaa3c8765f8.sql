
-- Create a table for storing CV analysis results
CREATE TABLE public.cv_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.candidate_resumes(id) ON DELETE CASCADE,
  extracted_skills TEXT[],
  extracted_experience TEXT[],
  industry_keywords TEXT[],
  experience_level TEXT,
  analysis_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for job recommendations
CREATE TABLE public.job_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cv_analysis_id UUID REFERENCES public.cv_analysis(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  match_score INTEGER DEFAULT 0,
  matching_keywords TEXT[],
  recommendation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.cv_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cv_analysis
CREATE POLICY "Users can view their own CV analysis" 
  ON public.cv_analysis 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own CV analysis" 
  ON public.cv_analysis 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CV analysis" 
  ON public.cv_analysis 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CV analysis" 
  ON public.cv_analysis 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for job_recommendations
CREATE POLICY "Users can view their own job recommendations" 
  ON public.job_recommendations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own job recommendations" 
  ON public.job_recommendations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job recommendations" 
  ON public.job_recommendations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job recommendations" 
  ON public.job_recommendations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_cv_analysis_user_id ON public.cv_analysis(user_id);
CREATE INDEX idx_cv_analysis_resume_id ON public.cv_analysis(resume_id);
CREATE INDEX idx_job_recommendations_user_id ON public.job_recommendations(user_id);
CREATE INDEX idx_job_recommendations_cv_analysis_id ON public.job_recommendations(cv_analysis_id);
CREATE INDEX idx_job_recommendations_job_id ON public.job_recommendations(job_id);
CREATE INDEX idx_job_recommendations_match_score ON public.job_recommendations(match_score DESC);

-- Update trigger for timestamps
CREATE OR REPLACE FUNCTION update_cv_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cv_analysis_updated_at
  BEFORE UPDATE ON public.cv_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_cv_analysis_updated_at();
