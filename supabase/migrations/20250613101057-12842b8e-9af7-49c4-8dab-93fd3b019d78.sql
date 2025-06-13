
-- Create employer notifications table
CREATE TABLE public.employer_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('new_application', 'application_status_update', 'new_message', 'job_approval_status', 'subscription_updates')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for employer notifications
ALTER TABLE public.employer_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own employer notifications" 
  ON public.employer_notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own employer notifications" 
  ON public.employer_notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  push_enabled BOOLEAN NOT NULL DEFAULT false,
  frequency TEXT NOT NULL DEFAULT 'instant' CHECK (frequency IN ('instant', 'daily', 'weekly', 'disabled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, notification_type)
);

-- Add RLS for notification preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notification preferences" 
  ON public.notification_preferences 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Function to create application status notifications
CREATE OR REPLACE FUNCTION create_application_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify candidate about status change
  IF OLD.status != NEW.status THEN
    INSERT INTO public.candidate_notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.user_id,
      'application_update',
      'Application Status Updated',
      'Your application status has been changed to: ' || NEW.status,
      jsonb_build_object('application_id', NEW.id, 'job_id', NEW.job_id, 'old_status', OLD.status, 'new_status', NEW.status)
    );
    
    -- Notify employer about status change if it's a withdrawal
    IF NEW.status = 'withdrawn' THEN
      INSERT INTO public.employer_notifications (user_id, type, title, message, metadata)
      VALUES (
        NEW.employer_id,
        'application_status_update',
        'Application Withdrawn',
        'A candidate has withdrawn their application',
        jsonb_build_object('application_id', NEW.id, 'job_id', NEW.job_id, 'candidate_id', NEW.user_id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create new application notifications for employers
CREATE OR REPLACE FUNCTION create_new_application_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.employer_notifications (user_id, type, title, message, metadata)
  VALUES (
    NEW.employer_id,
    'new_application',
    'New Job Application',
    'You have received a new application for your job posting',
    jsonb_build_object('application_id', NEW.id, 'job_id', NEW.job_id, 'candidate_id', NEW.user_id)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create message notifications
CREATE OR REPLACE FUNCTION create_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  conversation_data RECORD;
  recipient_role TEXT;
BEGIN
  -- Get conversation details
  SELECT * INTO conversation_data FROM public.conversations WHERE id = NEW.conversation_id;
  
  -- Determine recipient role and create appropriate notification
  IF NEW.recipient_id = conversation_data.candidate_id THEN
    recipient_role := 'candidate';
    INSERT INTO public.candidate_notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.recipient_id,
      'new_message',
      'New Message',
      'You have received a new message',
      jsonb_build_object('conversation_id', NEW.conversation_id, 'sender_id', NEW.sender_id, 'message_id', NEW.id)
    );
  ELSE
    recipient_role := 'employer';
    INSERT INTO public.employer_notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.recipient_id,
      'new_message',
      'New Message',
      'You have received a new message from a candidate',
      jsonb_build_object('conversation_id', NEW.conversation_id, 'sender_id', NEW.sender_id, 'message_id', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile view notifications
CREATE OR REPLACE FUNCTION create_profile_view_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.candidate_notifications (user_id, type, title, message, metadata)
  VALUES (
    NEW.profile_id,
    'profile_view',
    'Profile Viewed',
    'Someone viewed your profile',
    jsonb_build_object('viewer_id', NEW.viewer_id, 'viewed_at', NEW.viewed_at)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER application_status_notification_trigger
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION create_application_notification();

CREATE TRIGGER new_application_notification_trigger
  AFTER INSERT ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION create_new_application_notification();

CREATE TRIGGER message_notification_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION create_message_notification();

CREATE TRIGGER profile_view_notification_trigger
  AFTER INSERT ON public.profile_views
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_view_notification();

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.employer_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_preferences;

-- Set replica identity for realtime updates
ALTER TABLE public.employer_notifications REPLICA IDENTITY FULL;
ALTER TABLE public.notification_preferences REPLICA IDENTITY FULL;
