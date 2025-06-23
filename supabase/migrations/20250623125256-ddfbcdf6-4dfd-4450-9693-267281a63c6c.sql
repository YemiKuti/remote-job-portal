
-- Add columns to track job posting validity and expiration
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS posted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS days_valid INTEGER DEFAULT 180; -- 6 months = ~180 days

-- Create an index for efficient querying of expired jobs
CREATE INDEX IF NOT EXISTS idx_jobs_expires_at ON public.jobs(expires_at);

-- Create a function to automatically set expiration date when job is posted
CREATE OR REPLACE FUNCTION set_job_expiration()
RETURNS TRIGGER AS $$
BEGIN
  -- Set posted_at when status changes to 'active' and it wasn't set before
  IF NEW.status = 'active' AND (OLD.status != 'active' OR OLD.posted_at IS NULL) THEN
    NEW.posted_at = now();
    NEW.expires_at = now() + INTERVAL '6 months';
  END IF;
  
  -- If job is being reactivated, extend expiration by 6 months from now
  IF NEW.status = 'active' AND OLD.status IN ('expired', 'inactive') AND OLD.posted_at IS NOT NULL THEN
    NEW.posted_at = now();
    NEW.expires_at = now() + INTERVAL '6 months';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set expiration dates
DROP TRIGGER IF EXISTS trigger_set_job_expiration ON public.jobs;
CREATE TRIGGER trigger_set_job_expiration
  BEFORE UPDATE OR INSERT ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION set_job_expiration();

-- Create a function to check and expire jobs that have passed their expiration date
CREATE OR REPLACE FUNCTION expire_old_jobs()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE public.jobs 
  SET status = 'expired'
  WHERE status = 'active' 
    AND expires_at < now();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Update existing active jobs to have expiration dates (6 months from now)
UPDATE public.jobs 
SET posted_at = COALESCE(created_at, now()),
    expires_at = COALESCE(created_at, now()) + INTERVAL '6 months'
WHERE status = 'active' AND expires_at IS NULL;
