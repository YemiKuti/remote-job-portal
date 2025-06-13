
-- Add missing INSERT policy for candidate notifications
CREATE POLICY "Allow notification creation" 
  ON public.candidate_notifications 
  FOR INSERT 
  WITH CHECK (true);

-- Also add INSERT policy for employer notifications to ensure consistency
CREATE POLICY "Allow employer notification creation" 
  ON public.employer_notifications 
  FOR INSERT 
  WITH CHECK (true);
