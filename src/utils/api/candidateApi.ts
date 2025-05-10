import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Application, SavedJob } from '@/types/api';

// Fetch candidate applications
export const fetchCandidateApplications = async (userId: string) => {
  try {
    // Fetch applications first
    const { data: applications, error: appError } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('applied_date', { ascending: false });

    if (appError) throw appError;

    // Fetch job details separately for each application
    const enhancedApplications: Application[] = [];
    
    for (const app of applications) {
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', app.job_id)
        .single();
        
      if (!jobError && jobData) {
        enhancedApplications.push({
          ...app,
          position: jobData.title,
          company: jobData.company,
          location: jobData.location
        });
      } else {
        enhancedApplications.push(app);
      }
    }

    return enhancedApplications;
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return [];
  }
};

// Fetch saved jobs
export const fetchSavedJobs = async (userId: string) => {
  try {
    // Get saved_jobs records
    const { data: savedJobRecords, error: savedJobError } = await supabase
      .from('saved_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('saved_date', { ascending: false });

    if (savedJobError) throw savedJobError;
    
    // Fetch job details for each saved job
    const savedJobs: SavedJob[] = [];
    
    for (const savedJob of savedJobRecords) {
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', savedJob.job_id)
        .single();
        
      if (!jobError && jobData) {
        savedJobs.push({
          ...savedJob,
          job: jobData
        });
      } else {
        savedJobs.push(savedJob);
      }
    }
    
    return savedJobs;
  } catch (error: any) {
    console.error('Error fetching saved jobs:', error);
    return [];
  }
};

// Save or unsave a job
export const toggleSaveJob = async (userId: string, jobId: string, currentlySaved: boolean) => {
  try {
    if (currentlySaved) {
      // Remove from saved jobs
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', userId)
        .eq('job_id', jobId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Job removed from saved jobs",
      });
    } else {
      // Add to saved jobs
      const { error } = await supabase
        .from('saved_jobs')
        .insert({
          user_id: userId,
          job_id: jobId,
          saved_date: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Job saved successfully",
      });
    }
    
    return true;
  } catch (error: any) {
    console.error('Error toggling saved job:', error);
    toast({
      title: "Error",
      description: "Failed to update saved jobs",
      variant: "destructive",
    });
    return false;
  }
};

// Update candidate profile
export const updateCandidateProfile = async (userId: string, data: { 
  full_name?: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
  title?: string;
  experience?: number;
  skills?: string;
  bio?: string;
}) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId);
      
    if (error) throw error;
    
    toast.success("Profile updated successfully");
    return true;
  } catch (error: any) {
    console.error('Error updating profile:', error);
    toast.error("Failed to update profile");
    return false;
  }
};

// Upload profile photo
export const uploadProfilePhoto = async (userId: string, file: File) => {
  try {
    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    // Upload the file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);
      
    const avatarUrl = publicUrlData.publicUrl;
    
    // Update the user's profile with the new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);
      
    if (updateError) throw updateError;
    
    // Also update the user metadata
    await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl }
    });
    
    toast.success("Profile photo updated successfully");
    return avatarUrl;
  } catch (error: any) {
    console.error('Error uploading profile photo:', error);
    toast.error("Failed to upload profile photo");
    return null;
  }
};
