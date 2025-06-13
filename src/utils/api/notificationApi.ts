
import { supabase } from '@/integrations/supabase/client';

export interface NotificationPreference {
  id?: string;
  user_id: string;
  notification_type: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
  push_enabled: boolean;
  frequency: 'instant' | 'daily' | 'weekly' | 'disabled';
}

export const fetchNotificationPreferences = async (userId: string): Promise<NotificationPreference[]> => {
  console.log('📧 Fetching notification preferences for user:', userId);
  
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('📧 Error fetching notification preferences:', error);
    throw error;
  }

  return data || [];
};

export const updateNotificationPreference = async (
  userId: string,
  notificationType: string,
  updates: Partial<NotificationPreference>
): Promise<boolean> => {
  console.log('📧 Updating notification preference:', { userId, notificationType, updates });
  
  // Check if preference exists
  const { data: existing } = await supabase
    .from('notification_preferences')
    .select('id')
    .eq('user_id', userId)
    .eq('notification_type', notificationType)
    .single();

  if (existing) {
    // Update existing preference
    const { error } = await supabase
      .from('notification_preferences')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', existing.id);

    if (error) {
      console.error('📧 Error updating notification preference:', error);
      throw error;
    }
  } else {
    // Create new preference
    const { error } = await supabase
      .from('notification_preferences')
      .insert({
        user_id: userId,
        notification_type: notificationType,
        ...updates
      });

    if (error) {
      console.error('📧 Error creating notification preference:', error);
      throw error;
    }
  }

  return true;
};

export const triggerJobRecommendations = async (): Promise<{ success: boolean; message: string }> => {
  console.log('📧 Triggering job recommendations...');
  
  try {
    const { data, error } = await supabase.functions.invoke('job-recommendations');
    
    if (error) {
      console.error('📧 Error triggering job recommendations:', error);
      throw error;
    }
    
    console.log('📧 Job recommendations triggered successfully:', data);
    return { success: true, message: data.message || 'Job recommendations sent successfully' };
  } catch (error: any) {
    console.error('📧 Failed to trigger job recommendations:', error);
    return { success: false, message: error.message || 'Failed to trigger job recommendations' };
  }
};

export const markNotificationAsRead = async (
  notificationId: string,
  table: 'candidate_notifications' | 'employer_notifications'
): Promise<boolean> => {
  console.log('📧 Marking notification as read:', { notificationId, table });
  
  const { error } = await supabase
    .from(table)
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('📧 Error marking notification as read:', error);
    throw error;
  }

  return true;
};

export const deleteNotification = async (
  notificationId: string,
  table: 'candidate_notifications' | 'employer_notifications'
): Promise<boolean> => {
  console.log('📧 Deleting notification:', { notificationId, table });
  
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('📧 Error deleting notification:', error);
    throw error;
  }

  return true;
};
