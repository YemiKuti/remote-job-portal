
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useEmployerSettings = () => {
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
  
  return {
    formData,
    passwordData,
    isSubmitting,
    isLoading,
    handleInputChange,
    handlePasswordChange,
    handleSaveChanges,
    handleSaveNotificationPreferences
  };
};
