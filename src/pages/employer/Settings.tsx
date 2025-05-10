
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Import our new components
import { GeneralSettingsForm } from '@/components/employer/settings/GeneralSettingsForm';
import { NotificationSettings } from '@/components/employer/settings/NotificationSettings';
import { BillingSettings } from '@/components/employer/settings/BillingSettings';
import { TeamMembersSettings } from '@/components/employer/settings/TeamMembersSettings';

const EmployerSettings = () => {
  const { user, refreshSession } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    jobTitle: user?.user_metadata?.title || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        if (data) {
          setFormData({
            fullName: data.full_name || user?.user_metadata?.full_name || '',
            email: user?.email || '',
            phone: user?.user_metadata?.phone || '',
            jobTitle: user?.user_metadata?.title || '',
          });
        }
      } catch (error) {
        console.error('Error in fetchProfileData:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSaveChanges = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Update profile in database with fields that exist in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update user metadata with additional fields that don't exist in profiles table
      const metadataUpdates = {
        full_name: formData.fullName,
        phone: formData.phone,
        title: formData.jobTitle
      };
      
      await supabase.auth.updateUser({
        data: metadataUpdates
      });
      
      await refreshSession();
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSaveNotificationPreferences = () => {
    toast.success("Notification preferences saved");
  };
  
  if (isLoading) {
    return (
      <DashboardLayout userType="employer">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout userType="employer">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <Separator />
        
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="team">Team Members</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <GeneralSettingsForm 
              formData={formData}
              passwordData={passwordData}
              handleInputChange={handleInputChange}
              handlePasswordChange={handlePasswordChange}
              handleSaveChanges={handleSaveChanges}
              isSubmitting={isSubmitting}
            />
          </TabsContent>
          
          <TabsContent value="notifications">
            <NotificationSettings 
              handleSaveNotificationPreferences={handleSaveNotificationPreferences}
            />
          </TabsContent>
          
          <TabsContent value="billing">
            <BillingSettings />
          </TabsContent>
          
          <TabsContent value="team">
            <TeamMembersSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default EmployerSettings;
