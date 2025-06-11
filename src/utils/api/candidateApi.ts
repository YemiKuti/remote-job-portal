import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Application, SavedJob } from '@/types/api';
import { jobs } from '@/data/jobs';

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
      // First try to get job from database
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
        // Fallback to static job data
        const staticJob = jobs.find(job => job.id === savedJob.job_id);
        if (staticJob) {
          savedJobs.push({
            ...savedJob,
            job: {
              title: staticJob.title,
              company: staticJob.company,
              location: staticJob.location,
              description: staticJob.description,
              salary_min: staticJob.salary.min,
              salary_max: staticJob.salary.max,
              employment_type: staticJob.employmentType,
              tech_stack: staticJob.techStack
            }
          });
        } else {
          // Include the saved job record even if we can't find job details
          savedJobs.push(savedJob);
        }
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
      
      toast("Job removed from saved jobs");
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
      
      toast("Job saved successfully");
    }
    
    return true;
  } catch (error: any) {
    console.error('Error toggling saved job:', error);
    toast.error("Failed to update saved jobs");
    return false;
  }
};

// Fetch recommended jobs based on user profile and skills
export const fetchRecommendedJobs = async (userId: string, limit = 3) => {
  try {
    // Get user profile data to base recommendations on
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.log('No profile found, fetching recent active jobs');
      // Fallback to recent active jobs if no profile
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    }

    // For now, just return recent active jobs since user_metadata is not available in profiles
    const { data: recommendedJobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return recommendedJobs || [];
  } catch (error: any) {
    console.error('Error fetching recommended jobs:', error);
    // Fallback to recent jobs
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (fallbackError) {
      console.error('Error fetching fallback jobs:', fallbackError);
      return [];
    }
  }
};

// Apply to a job
export const applyToJob = async (userId: string, jobId: string, employerId?: string) => {
  try {
    // Check if already applied
    const { data: existingApplication, error: checkError } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .single();

    if (existingApplication) {
      toast.error("You have already applied to this job");
      return false;
    }

    // Create application
    const { error } = await supabase
      .from('applications')
      .insert({
        user_id: userId,
        job_id: jobId,
        employer_id: employerId,
        status: 'pending',
        applied_date: new Date().toISOString()
      });

    if (error) throw error;

    // Note: Since increment_job_applications function doesn't exist,
    // we'll skip this step for now
    console.log('Application created successfully');

    toast.success("Application submitted successfully!");
    return true;
  } catch (error: any) {
    console.error('Error applying to job:', error);
    toast.error("Failed to submit application. Please try again.");
    return false;
  }
};

// Withdraw application
export const withdrawApplication = async (applicationId: string) => {
  try {
    const { error } = await supabase
      .from('applications')
      .update({ status: 'withdrawn' })
      .eq('id', applicationId);

    if (error) throw error;

    toast.success("Application withdrawn successfully");
    return true;
  } catch (error: any) {
    console.error('Error withdrawing application:', error);
    toast.error("Failed to withdraw application");
    return false;
  }
};

// Track profile view
export const trackProfileView = async (viewerId: string, profileId: string) => {
  try {
    // Don't track self-views
    if (viewerId === profileId) return;

    const { error } = await supabase
      .from('profile_views')
      .insert({
        viewer_id: viewerId,
        profile_id: profileId,
        viewed_at: new Date().toISOString()
      });

    if (error && error.code !== '23505') { // Ignore duplicate key violations
      throw error;
    }
  } catch (error: any) {
    console.error('Error tracking profile view:', error);
  }
};

// Get profile view count
export const getProfileViewCount = async (profileId: string) => {
  try {
    const { count, error } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId);

    if (error) throw error;
    return count || 0;
  } catch (error: any) {
    console.error('Error fetching profile view count:', error);
    return 0;
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
  website?: string;
}) => {
  try {
    // First, check if these columns exist
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;
    
    // Get only the fields that actually exist in the profiles table
    const sanitizedData: any = {};
    
    // Always include these fields which we know exist in the profiles table
    if (data.full_name !== undefined) sanitizedData.full_name = data.full_name;
    if (data.avatar_url !== undefined) sanitizedData.avatar_url = data.avatar_url;
    if (data.website !== undefined) sanitizedData.website = data.website;
    
    // These fields might not exist in some tables, add them conditionally
    // We'll store them as user metadata for now
    const userMetadataUpdates: any = {};
    
    if (data.phone !== undefined) userMetadataUpdates.phone = data.phone;
    if (data.location !== undefined) userMetadataUpdates.location = data.location;
    if (data.title !== undefined) userMetadataUpdates.title = data.title;
    if (data.experience !== undefined) userMetadataUpdates.experience = data.experience;
    if (data.skills !== undefined) userMetadataUpdates.skills = data.skills;
    if (data.bio !== undefined) userMetadataUpdates.bio = data.bio;
    
    // Update profiles table with fields that exist
    if (Object.keys(sanitizedData).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update(sanitizedData)
        .eq('id', userId);
        
      if (error) throw error;
    }
    
    // Update user metadata with additional fields
    if (Object.keys(userMetadataUpdates).length > 0) {
      const { error } = await supabase.auth.updateUser({
        data: userMetadataUpdates
      });
      
      if (error) throw error;
    }
    
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
    
    toast.success("Profile photo updated successfully");
    return avatarUrl;
  } catch (error: any) {
    console.error('Error uploading profile photo:', error);
    toast.error("Failed to upload profile photo");
    return null;
  }
};
