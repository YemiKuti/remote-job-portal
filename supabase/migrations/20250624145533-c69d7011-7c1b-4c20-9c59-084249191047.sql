
-- Create password_reset_attempts table for audit logging
CREATE TABLE public.password_reset_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  recovery_token_preview TEXT,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.password_reset_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view all password reset attempts
CREATE POLICY "Admins can view all password reset attempts" 
  ON public.password_reset_attempts 
  FOR SELECT 
  USING (public.is_current_user_admin() = true);

-- Create policy for users to view their own password reset attempts
CREATE POLICY "Users can view their own password reset attempts" 
  ON public.password_reset_attempts 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for inserting password reset attempts (anyone can log attempts)
CREATE POLICY "Anyone can log password reset attempts" 
  ON public.password_reset_attempts 
  FOR INSERT 
  WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX idx_password_reset_attempts_user_id ON public.password_reset_attempts(user_id);
CREATE INDEX idx_password_reset_attempts_email ON public.password_reset_attempts(email);
CREATE INDEX idx_password_reset_attempts_attempted_at ON public.password_reset_attempts(attempted_at DESC);
