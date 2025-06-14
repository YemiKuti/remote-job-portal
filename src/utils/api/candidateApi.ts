import { supabase } from '@/integrations/supabase/client';
import { SavedJob, Application, TailoredResume } from '@/types/api';
import { transformDatabaseJobToFrontendJob } from '@/utils/jobTransformers';

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

// Fetch candidate applications
export const fetchCandidateApplications = async (userId: string): Promise<Application[]> => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs!applications_job_id_fkey(*)
      `)
      .eq('user_id', userId)
      .order('applied_date', { ascending: false });

    if (error) throw error;

    return (data || []).map(application => ({
      ...application,
      status: application.status as 'pending' | 'reviewing' | 'interview' | 'rejected' | 'accepted' | 'withdrawn',
      job: application.jobs ? application.jobs : undefined
    }));
  } catch (error: any) {
    console.error('Error fetching applications:', error);
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

// Fetch saved jobs - fix the join query
export const fetchSavedJobs = async (userId: string): Promise<SavedJob[]> => {
  try {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select(`
        *,
        jobs!saved_jobs_job_id_fkey(*)
      `)
      .eq('user_id', userId)
      .order('saved_date', { ascending: false });

    if (error) throw error;

    return (data || []).map(savedJob => ({
      ...savedJob,
      job: savedJob.jobs ? savedJob.jobs : null
    }));
  } catch (error: any) {
    console.error('Error fetching saved jobs:', error);
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

// Update candidate profile - FIXED VERSION
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

    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error: any) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }
};

// Fetch recommended jobs for candidate
export const fetchRecommendedJobs = async (userId: string, limit = 3) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .limit(limit);

    if (error) throw error;
    
    return (data || []).map(transformDatabaseJobToFrontendJob);
  } catch (error: any) {
    console.error('Error fetching recommended jobs:', error);
    return [];
  }
};
