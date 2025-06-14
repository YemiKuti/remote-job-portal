import { supabase } from '@/integrations/supabase/client';

// Apply to a job
export const applyToJob = async (userId: string, jobId: string, employerId?: string, coverLetter?: string) => {
  try {
    console.log('🔄 Applying to job:', { userId, jobId, employerId, hasCoverLetter: !!coverLetter });
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    // Check if user has already applied for this job
    const { data: existingApplication, error: checkError } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing application:', checkError);
      throw checkError;
    }

    if (existingApplication) {
      throw new Error('You have already applied for this job');
    }

    // Get job details to extract employer_id if not provided
    let finalEmployerId = employerId;
    if (!finalEmployerId) {
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('employer_id')
        .eq('id', jobId)
        .single();

      if (jobError) {
        console.error('❌ Error fetching job details:', jobError);
        throw new Error('Failed to fetch job details');
      }

      if (!jobData.employer_id) {
        throw new Error('Job is missing employer information');
      }

      finalEmployerId = jobData.employer_id;
    }

    // Validate that we have an employer_id
    if (!finalEmployerId) {
      throw new Error('Employer ID is required but not provided');
    }

    // Create the application with employer_id and cover letter
    const { error } = await supabase
      .from('applications')
      .insert({
        user_id: userId,
        job_id: jobId,
        employer_id: finalEmployerId,
        status: 'pending',
        cover_letter: coverLetter || null
      });

    if (error) {
      console.error('❌ Database error creating application:', error);
      throw error;
    }

    console.log('✅ Successfully applied to job with cover letter');
    return true;
  } catch (error: any) {
    console.error('❌ Error applying to job:', error);
    throw error;
  }
};

// Withdraw application
export const withdrawApplication = async (applicationId: string) => {
  try {
    console.log('🔄 Withdrawing application:', applicationId);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', applicationId)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('❌ Database error withdrawing application:', error);
      throw error;
    }

    console.log('✅ Successfully withdrew application');
    return true;
  } catch (error: any) {
    console.error('❌ Error withdrawing application:', error);
    throw error;
  }
};

// Fetch candidate applications
export const fetchCandidateApplications = async (userId: string) => {
  try {
    console.log('🔄 Fetching candidate applications for user:', userId);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs(*)
      `)
      .eq('user_id', userId)
      .order('applied_date', { ascending: false });

    if (error) {
      console.error('❌ Database error fetching applications:', error);
      throw error;
    }

    console.log('✅ Fetched candidate applications:', data?.length || 0);
    return data || [];
  } catch (error: any) {
    console.error('❌ Error fetching candidate applications:', error);
    throw error;
  }
};

// Toggle save job
export const toggleSaveJob = async (userId: string, jobId: string, currentlySaved?: boolean) => {
  try {
    console.log('🔄 Toggling save job:', { userId, jobId, currentlySaved });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    if (currentlySaved === true) {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', userId)
        .eq('job_id', jobId);

      if (error) {
        console.error('❌ Database error removing saved job:', error);
        throw error;
      }

      console.log('✅ Removed job from saved jobs');
      return { saved: false };
    }

    if (currentlySaved === undefined) {
      const { data: existingSave, error: checkError } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('user_id', userId)
        .eq('job_id', jobId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking saved job:', checkError);
        throw checkError;
      }

      if (existingSave) {
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('id', existingSave.id);

        if (error) {
          console.error('❌ Database error removing saved job:', error);
          throw error;
        }

        console.log('✅ Removed job from saved jobs');
        return { saved: false };
      }
    }

    const { error } = await supabase
      .from('saved_jobs')
      .insert({
        user_id: userId,
        job_id: jobId
      });

    if (error) {
      console.error('❌ Database error saving job:', error);
      throw error;
    }

    console.log('✅ Added job to saved jobs');
    return { saved: true };
  } catch (error: any) {
    console.error('❌ Error toggling save job:', error);
    throw error;
  }
};

// Fetch saved jobs - fix the join query
export const fetchSavedJobs = async (userId: string) => {
  try {
    console.log('🔄 Fetching saved jobs for user:', userId);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    const { data: savedJobsData, error: savedJobsError } = await supabase
      .from('saved_jobs')
      .select('id, job_id, saved_date')
      .eq('user_id', userId)
      .order('saved_date', { ascending: false });

    if (savedJobsError) {
      console.error('❌ Database error fetching saved jobs:', savedJobsError);
      throw savedJobsError;
    }

    if (!savedJobsData || savedJobsData.length === 0) {
      console.log('✅ No saved jobs found');
      return [];
    }

    const jobIds = savedJobsData.map(sj => sj.job_id);
    const { data: jobsData, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .in('id', jobIds);

    if (jobsError) {
      console.error('❌ Database error fetching job details:', jobsError);
      throw jobsError;
    }

    const result = savedJobsData.map(savedJob => {
      const jobData = jobsData?.find(job => job.id === savedJob.job_id);
      return {
        id: savedJob.id,
        user_id: userId,
        job_id: savedJob.job_id,
        saved_date: savedJob.saved_date,
        job: jobData ? {
          title: jobData.title,
          company: jobData.company,
          location: jobData.location,
          description: jobData.description,
          salary_min: jobData.salary_min,
          salary_max: jobData.salary_max,
          employment_type: jobData.employment_type,
          tech_stack: jobData.tech_stack || []
        } : null
      };
    });

    console.log('✅ Fetched saved jobs:', result.length);
    return result;
  } catch (error: any) {
    console.error('❌ Error fetching saved jobs:', error);
    throw error;
  }
};

// Track profile view
export const trackProfileView = async (viewerId: string, profileId: string) => {
  try {
    console.log('🔄 Tracking profile view:', { viewerId, profileId });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    if (viewerId === profileId) {
      return true;
    }

    const { error } = await supabase
      .from('profile_views')
      .insert({
        viewer_id: viewerId,
        profile_id: profileId
      });

    if (error) {
      console.error('❌ Database error tracking profile view:', error);
      throw error;
    }

    console.log('✅ Profile view tracked');
    return true;
  } catch (error: any) {
    console.error('❌ Error tracking profile view:', error);
    throw error;
  }
};

// Get profile view count
export const getProfileViewCount = async (profileId: string) => {
  try {
    console.log('🔄 Getting profile view count for:', profileId);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    const { count, error } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId);

    if (error) {
      console.error('❌ Database error getting profile view count:', error);
      throw error;
    }

    console.log('✅ Profile view count:', count);
    return count || 0;
  } catch (error: any) {
    console.error('❌ Error getting profile view count:', error);
    throw error;
  }
};

// Update candidate profile - FIXED VERSION
export const updateCandidateProfile = async (userId: string, profileData: any) => {
  try {
    console.log('🔄 Updating candidate profile:', userId, profileData);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    const updateData: any = {};
    
    if (profileData.full_name !== undefined) updateData.full_name = profileData.full_name;
    if (profileData.phone !== undefined) updateData.phone = profileData.phone;
    if (profileData.location !== undefined) updateData.location = profileData.location;
    if (profileData.title !== undefined) updateData.title = profileData.title;
    if (profileData.experience !== undefined) updateData.experience = profileData.experience;
    if (profileData.skills !== undefined) updateData.skills = profileData.skills;
    if (profileData.bio !== undefined) updateData.bio = profileData.bio;

    console.log('📝 Profile update data:', updateData);

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('❌ Database error updating profile:', error);
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    console.log('✅ Profile updated successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Error updating candidate profile:', error);
    throw error;
  }
};

// Upload profile photo - FIXED VERSION
export const uploadProfilePhoto = async (userId: string, file: File) => {
  try {
    console.log('🔄 Uploading profile photo for user:', userId);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file (PNG, JPG, WebP)');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }

    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `profile-${timestamp}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    console.log('📁 Upload path:', filePath);

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, {
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Storage error uploading photo:', uploadError);
      throw new Error(`Failed to upload photo: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);

    console.log('🔗 Public URL:', data.publicUrl);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: data.publicUrl })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Database error updating avatar URL:', updateError);
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    console.log('✅ Profile photo uploaded successfully');
    return data.publicUrl;
  } catch (error: any) {
    console.error('❌ Error uploading profile photo:', error);
    throw error;
  }
};

// Fetch recommended jobs for candidate
export const fetchRecommendedJobs = async (userId: string) => {
  try {
    console.log('🔄 Fetching recommended jobs for user:', userId);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Database error fetching recommended jobs:', error);
      throw error;
    }

    console.log('✅ Fetched recommended jobs:', data?.length || 0);
    return data || [];
  } catch (error: any) {
    console.error('❌ Error fetching recommended jobs:', error);
    throw error;
  }
};
