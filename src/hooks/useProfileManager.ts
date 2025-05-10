
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { uploadProfilePhoto, updateCandidateProfile } from '@/utils/api/candidateApi';

export function useProfileManager() {
  const { user, refreshSession } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    phone: user?.user_metadata?.phone || '',
    location: user?.user_metadata?.location || '',
    title: user?.user_metadata?.title || '',
    experience: user?.user_metadata?.experience ? String(user?.user_metadata?.experience) : '',
    skills: user?.user_metadata?.skills || '',
    bio: user?.user_metadata?.bio || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile data when component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        // Get profile data from the profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        // Combine profile data with user metadata for the extended fields
        const userMetadata = user.user_metadata || {};
        
        setFormData({
          fullName: data?.full_name || user?.user_metadata?.full_name || '',
          phone: userMetadata.phone || '',
          location: userMetadata.location || '',
          title: userMetadata.title || '',
          experience: userMetadata.experience ? String(userMetadata.experience) : '',
          skills: userMetadata.skills || '',
          bio: userMetadata.bio || ''
        });
      } catch (error) {
        console.error('Error in fetchProfileData:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Open the preview dialog
      setShowPhotoDialog(true);
    }
  };
  
  // Trigger file input click
  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
  };
  
  // Upload the photo
  const handleUploadPhoto = async () => {
    if (!fileInputRef.current?.files?.[0] || !user) return;
    
    setIsUploading(true);
    try {
      const file = fileInputRef.current.files[0];
      const avatarUrl = await uploadProfilePhoto(user.id, file);
      
      if (avatarUrl) {
        // Refresh the session to get updated user metadata
        await refreshSession();
        setShowPhotoDialog(false);
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  // Cancel photo upload
  const handleCancelPhotoUpload = () => {
    setShowPhotoDialog(false);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Save profile changes
  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const profileData = {
        full_name: formData.fullName,
        phone: formData.phone,
        location: formData.location,
        title: formData.title,
        experience: formData.experience ? Number(formData.experience) : undefined,
        skills: formData.skills,
        bio: formData.bio
      };
      
      const success = await updateCandidateProfile(user.id, profileData);
      
      if (success) {
        // Refresh the session to update user metadata
        await refreshSession();
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    user,
    formData,
    isLoading,
    isSubmitting,
    isUploading,
    fileInputRef,
    photoPreview,
    showPhotoDialog,
    setShowPhotoDialog,
    handleChoosePhoto,
    handleFileChange,
    handleInputChange,
    handleUploadPhoto,
    handleCancelPhotoUpload,
    handleSaveProfile
  };
}
