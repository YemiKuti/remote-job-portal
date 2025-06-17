
import { supabase } from '@/integrations/supabase/client';
import { SavedJob, Application, TailoredResume } from '@/types/api';
import { transformDatabaseJobToFrontendJob } from '@/utils/jobTransformers';

// Check if user has already applied to a job
export const checkExistingApplication = async (jobId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('applications')
      .select('id, applied_date, status')
      .eq('user_id', user.id)
      .eq('job_id', jobId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error checking existing application:', error);
    throw error;
  }
};

// Apply to a job
export const applyToJob = async (applicationData: {
  jobId: string;
  employerId: string;
  coverLetter?: string;
  portfolioUrl?: string;
  additionalNotes?: string;
  resumeId?: string;
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if user has already applied
    const existingApplication = await checkExistingApplication(applicationData.jobId);
    if (existingApplication) {
      throw new Error('You have already applied to this job');
    }

    const { data, error } = await supabase
      .from('applications')
      .insert({
        user_id: user.id,
        job_id: applicationData.jobId,
        employer_id: applicationData.employerId,
        cover_letter: applicationData.coverLetter,
        portfolio_url: applicationData.portfolioUrl,
        additional_notes: applicationData.additionalNotes,
        resume_id: applicationData.resumeId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error applying to job:', error);
    throw error;
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
    return true;
  } catch (error: any) {
    console.error('Error withdrawing application:', error);
    throw error;
  }
};

// Fetch candidate applications with proper job data
export const fetchCandidateApplications = async (userId: string): Promise<Application[]> => {
  try {
    console.log('🔍 Fetching applications for user:', userId);
    
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs!fk_applications_job_id (*)
      `)
      .eq('user_id', userId)
      .order('applied_date', { ascending: false });

    if (error) {
      console.error('❌ Error fetching applications:', error);
      throw error;
    }

    console.log('✅ Applications fetched:', data?.length || 0);

    return (data || []).map(application => ({
      ...application,
      status: application.status as 'pending' | 'reviewing' | 'interview' | 'rejected' | 'accepted' | 'withdrawn',
      job: application.jobs ? application.jobs : undefined
    }));
  } catch (error: any) {
    console.error('❌ Error in fetchCandidateApplications:', error);
    throw error;
  }
};

// Toggle save job
export const toggleSaveJob = async (userId: string, jobId: string, currentlySaved: boolean) => {
  try {
    if (currentlySaved) {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', userId)
        .eq('job_id', jobId);

      if (error) throw error;
      return { saved: false };
    } else {
      const { error } = await supabase
        .from('saved_jobs')
        .insert({
          user_id: userId,
          job_id: jobId
        });

      if (error) throw error;
      return { saved: true };
    }
  } catch (error: any) {
    console.error('Error toggling save job:', error);
    throw error;
  }
};

// Fetch saved jobs with proper job data using foreign key
export const fetchSavedJobs = async (userId: string): Promise<SavedJob[]> => {
  try {
    console.log('🔍 Fetching saved jobs for user:', userId);
    
    const { data, error } = await supabase
      .from('saved_jobs')
      .select(`
        *,
        jobs!fk_saved_jobs_job_id (*)
      `)
      .eq('user_id', userId)
      .order('saved_date', { ascending: false });

    if (error) {
      console.error('❌ Error fetching saved jobs:', error);
      throw error;
    }

    console.log('✅ Saved jobs fetched:', data?.length || 0);

    return (data || []).map(savedJob => ({
      ...savedJob,
      job: savedJob.jobs ? savedJob.jobs : null
    }));
  } catch (error: any) {
    console.error('❌ Error in fetchSavedJobs:', error);
    throw error;
  }
};

// Track profile view
export const trackProfileView = async (profileId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id === profileId) return;

    const { error } = await supabase
      .from('profile_views')
      .insert({
        viewer_id: user.id,
        profile_id: profileId
      });

    if (error) throw error;
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
    console.error('Error getting profile view count:', error);
    return 0;
  }
};

// Update candidate profile
export const updateCandidateProfile = async (profileData: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error updating candidate profile:', error);
    throw error;
  }
};

// Upload profile photo - FIXED VERSION
export const uploadProfilePhoto = async (file: File) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select a valid image file (PNG, JPG, JPEG, WebP)');
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }

    // Create unique filename with proper extension
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`;
    
    console.log('🔄 Uploading file to:', fileName);

    // Upload to Supabase Storage using correct bucket name
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    console.log('✅ File uploaded successfully:', uploadData);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(fileName);

    console.log('🔗 Public URL generated:', publicUrl);

    // Update profile with new avatar URL
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (profileError) {
      console.error('❌ Profile update error:', profileError);
      // Don't throw here - the upload was successful
      console.warn('⚠️ Avatar uploaded but profile update failed, continuing...');
    }

    return publicUrl;
  } catch (error: any) {
    console.error('❌ Error uploading profile photo:', error);
    throw new Error(error.message || 'Failed to upload profile photo');
  }
};

// Fetch recommended jobs for candidate - FIXED FUNCTION
export const fetchRecommendedJobs = async (userId: string, limit = 6) => {
  try {
    console.log('🔍 Fetching recommended jobs for user:', userId);
    
    // Get active jobs with a simple query
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching recommended jobs:', error);
      throw error;
    }
    
    console.log('✅ Recommended jobs fetched:', data?.length || 0);
    
    return (data || []).map(transformDatabaseJobToFrontendJob);
  } catch (error: any) {
    console.error('❌ Error in fetchRecommendedJobs:', error);
    return [];
  }
};
