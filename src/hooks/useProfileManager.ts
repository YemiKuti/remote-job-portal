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
  const [profileData, setProfileData] = useState<{ avatar_url?: string } | null>(null);
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

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        console.log('🔄 Fetching profile data for user:', user.id);
        
        // Get profile data from the profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('❌ Error fetching profile:', error);
          return;
        }
        
        console.log('✅ Profile data fetched:', data);
        setProfileData(data);
        
        // Update form data with database values, falling back to user metadata
        const userMetadata = user.user_metadata || {};
        
        setFormData({
          fullName: data?.full_name || userMetadata.full_name || '',
          phone: data?.phone || userMetadata.phone || '',
          location: data?.location || userMetadata.location || '',
          title: data?.title || userMetadata.title || '',
          experience: data?.experience ? String(data.experience) : (userMetadata.experience ? String(userMetadata.experience) : ''),
          skills: data?.skills || userMetadata.skills || '',
          bio: data?.bio || userMetadata.bio || ''
        });
      } catch (error) {
        console.error('❌ Error in fetchProfileData:', error);
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
  
  // Upload the photo - IMPROVED VERSION
  const handleUploadPhoto = async () => {
    if (!fileInputRef.current?.files?.[0] || !user) return;
    
    setIsUploading(true);
    try {
      const file = fileInputRef.current.files[0];
      console.log('🔄 Starting photo upload...', { fileName: file.name, fileSize: file.size });
      
      const avatarUrl = await uploadProfilePhoto(file);
      
      if (avatarUrl) {
        console.log('✅ Photo uploaded successfully:', avatarUrl);
        
        // Update local profile data immediately
        setProfileData(prev => ({ ...prev, avatar_url: avatarUrl }));
        
        // Update user metadata to ensure avatar shows immediately
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { avatar_url: avatarUrl }
        });
        
        if (metadataError) {
          console.error('⚠️ Error updating user metadata:', metadataError);
        } else {
          console.log('✅ User metadata updated successfully');
        }
        
        // Refresh the session to get updated user metadata
        await refreshSession();
        
        // Close dialog and reset form
        setShowPhotoDialog(false);
        setPhotoPreview(null);
        
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        toast.success('Profile photo updated successfully');
        
        // Force a small delay then reload to ensure all components get the new avatar
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error: any) {
      console.error('❌ Error uploading photo:', error);
      toast.error(error.message || 'Failed to upload photo. Please try again.');
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
  
  // Save profile changes - IMPROVED VERSION
  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      console.log('🔄 Saving profile changes...');
      
      const profileData = {
        full_name: formData.fullName,
        phone: formData.phone,
        location: formData.location,
        title: formData.title,
        experience: formData.experience ? Number(formData.experience) : null,
        skills: formData.skills,
        bio: formData.bio
      };
      
      console.log('📤 Sending profile data:', profileData);
      
      const success = await updateCandidateProfile(profileData);
      
      if (success) {
        // Update user metadata as well for consistency
        const { error: metadataError } = await supabase.auth.updateUser({
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            location: formData.location,
            title: formData.title,
            experience: formData.experience ? Number(formData.experience) : null,
            skills: formData.skills,
            bio: formData.bio
          }
        });
        
        if (metadataError) {
          console.error('⚠️ Error updating user metadata:', metadataError);
          // Don't fail the whole operation for metadata error
        }
        
        // Refresh the session to update user metadata
        await refreshSession();
        toast.success('Profile updated successfully');
      }
    } catch (error: any) {
      console.error('❌ Error saving profile:', error);
      toast.error(error.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    user,
    profileData,
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
