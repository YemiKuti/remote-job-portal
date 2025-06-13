
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Mail, Smartphone } from 'lucide-react';

interface NotificationPreference {
  id?: string;
  notification_type: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
  push_enabled: boolean;
  frequency: 'instant' | 'daily' | 'weekly' | 'disabled';
}

interface NotificationPreferencesProps {
  userId: string;
  userType: 'candidate' | 'employer';
}

export function NotificationPreferences({ userId, userType }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const notificationTypes = userType === 'candidate' 
    ? [
        { key: 'application_update', label: 'Application Status Updates', description: 'When your application status changes' },
        { key: 'new_message', label: 'New Messages', description: 'When you receive messages from employers' },
        { key: 'job_recommendation', label: 'Job Recommendations', description: 'When new jobs match your profile' },
        { key: 'profile_view', label: 'Profile Views', description: 'When employers view your profile' },
      ]
    : [
        { key: 'new_application', label: 'New Applications', description: 'When candidates apply to your jobs' },
        { key: 'application_status_update', label: 'Application Updates', description: 'When candidates withdraw applications' },
        { key: 'new_message', label: 'New Messages', description: 'When you receive messages from candidates' },
        { key: 'job_approval_status', label: 'Job Approval Status', description: 'When your job posts are approved or rejected' },
        { key: 'subscription_updates', label: 'Subscription Updates', description: 'Billing and plan changes' },
      ];

  useEffect(() => {
    fetchPreferences();
  }, [userId]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      // Create default preferences for types that don't exist
      const existingTypes = data?.map(p => p.notification_type) || [];
      const missingTypes = notificationTypes.filter(type => !existingTypes.includes(type.key));
      
      const defaultPreferences = missingTypes.map(type => ({
        notification_type: type.key,
        email_enabled: true,
        in_app_enabled: true,
        push_enabled: false,
        frequency: 'instant' as const
      }));

      setPreferences([...(data || []), ...defaultPreferences]);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (notificationType: string, updates: Partial<NotificationPreference>) => {
    try {
      setSaving(true);
      
      const existingPref = preferences.find(p => p.notification_type === notificationType);
      
      if (existingPref?.id) {
        // Update existing preference
        const { error } = await supabase
          .from('notification_preferences')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', existingPref.id);
        
        if (error) throw error;
      } else {
        // Create new preference
        const { error } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: userId,
            notification_type: notificationType,
            ...updates
          });
        
        if (error) throw error;
      }

      // Update local state
      setPreferences(prev => prev.map(p => 
        p.notification_type === notificationType 
          ? { ...p, ...updates }
          : p
      ));

      toast.success('Preferences updated');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Loading your notification settings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Customize how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {notificationTypes.map((type) => {
          const pref = preferences.find(p => p.notification_type === type.key) || {
            notification_type: type.key,
            email_enabled: true,
            in_app_enabled: true,
            push_enabled: false,
            frequency: 'instant' as const
          };

          return (
            <div key={type.key} className="space-y-4 border-b pb-4 last:border-b-0">
              <div>
                <h4 className="font-medium">{type.label}</h4>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor={`${type.key}-in-app`} className="text-sm">In-App</Label>
                  <Switch
                    id={`${type.key}-in-app`}
                    checked={pref.in_app_enabled}
                    onCheckedChange={(checked) => 
                      updatePreference(type.key, { in_app_enabled: checked })
                    }
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor={`${type.key}-email`} className="text-sm">Email</Label>
                  <Switch
                    id={`${type.key}-email`}
                    checked={pref.email_enabled}
                    onCheckedChange={(checked) => 
                      updatePreference(type.key, { email_enabled: checked })
                    }
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor={`${type.key}-push`} className="text-sm">Push</Label>
                  <Switch
                    id={`${type.key}-push`}
                    checked={pref.push_enabled}
                    onCheckedChange={(checked) => 
                      updatePreference(type.key, { push_enabled: checked })
                    }
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Label htmlFor={`${type.key}-frequency`} className="text-sm">Frequency</Label>
                  <Select
                    value={pref.frequency}
                    onValueChange={(value) => 
                      updatePreference(type.key, { frequency: value as 'instant' | 'daily' | 'weekly' | 'disabled' })
                    }
                    disabled={saving}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Instant</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          );
        })}

        <div className="pt-4">
          <p className="text-sm text-muted-foreground">
            Push notifications require browser permission and are currently in development.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
