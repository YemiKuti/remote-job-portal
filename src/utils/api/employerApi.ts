
import { supabase } from '@/integrations/supabase/client';

// Fetch candidate applications for an employer
export const fetchEmployerApplications = async (userId: string) => {
  try {
    console.log('🔄 Fetching employer applications for user:', userId);
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    console.log('🔍 User session valid, attempting to fetch applications...');
    
    // Fetch applications with job data
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs(
          id,
          title,
          company,
          location
        )
      `)
      .eq('employer_id', userId)
      .order('applied_date', { ascending: false });

    if (appsError) {
      console.error('❌ Database error fetching applications:', appsError);
      throw appsError;
    }

    // Fetch candidate profiles separately with all fields
    const userIds = applications?.map(app => app.user_id).filter(Boolean) || [];
    let candidates: any[] = [];
    
    if (userIds.length > 0) {
      const { data: candidateData, error: candidateError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
        
      if (candidateError) {
        console.error('❌ Error fetching candidate profiles:', candidateError);
        // Don't throw error, just use empty candidates array
      } else {
        candidates = candidateData || [];
      }
    }

    // Fetch resumes for applications that have resume_id
    const resumeIds = applications?.map(app => app.resume_id).filter(Boolean) || [];
    let resumes: any[] = [];
    
    if (resumeIds.length > 0) {
      const { data: resumeData, error: resumeError } = await supabase
        .from('candidate_resumes')
        .select('*')
        .in('id', resumeIds);
        
      if (resumeError) {
        console.error('❌ Error fetching resumes:', resumeError);
        // Don't throw error, just use empty resumes array
      } else {
        resumes = resumeData || [];
      }
    }

    // Combine applications with candidate data and resume data
    const applicationsWithCandidates = applications?.map(app => ({
      ...app,
      candidate: candidates.find(candidate => candidate.id === app.user_id) || null,
      resume: resumes.find(resume => resume.id === app.resume_id) || null
    })) || [];

    console.log(`✅ Found ${applicationsWithCandidates?.length || 0} applications for employer`);
    console.log('📊 Application details:', applicationsWithCandidates?.map(app => ({
      id: app.id,
      jobTitle: app.job?.title,
      candidateName: app.candidate?.full_name || app.candidate?.username,
      status: app.status,
      hasCoverLetter: !!app.cover_letter,
      hasResume: !!app.resume
    })));
    
    return applicationsWithCandidates;
  } catch (error: any) {
    console.error('❌ Error fetching employer applications:', error);
    throw error;
  }
};

// Fetch jobs created by an employer
export const fetchEmployerJobs = async (userId: string) => {
  try {
    console.log('🔄 Fetching employer jobs for user:', userId);
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    console.log('🔍 User session valid, attempting to fetch jobs...');
    console.log('🔍 Current user ID from auth:', session.user.id);
    console.log('🔍 Requested employer ID:', userId);
    
    // First, let's try a simple query to see what happens
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('❌ Database error fetching jobs:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      
      // If it's a permission error, let's try a different approach
      if (error.code === 'PGRST301' || error.message?.includes('permission denied')) {
        console.log('⚠️ Permission denied, checking if user can access any jobs...');
        
        // Try to fetch any jobs to see if the table is accessible at all
        const { data: testData, error: testError } = await supabase
          .from('jobs')
          .select('id, title')
          .limit(1);
          
        if (testError) {
          console.error('❌ Cannot access jobs table at all:', testError);
          throw new Error('Database access denied. Please contact support.');
        } else {
          console.log('✅ Can access jobs table, but not employer-specific jobs');
          throw new Error('You do not have permission to view jobs for this employer ID.');
        }
      }
      
      throw error;
    }
    
    console.log('✅ Fetched jobs:', data?.length || 0);
    return data || [];
  } catch (error: any) {
    console.error('❌ Error fetching employer jobs:', error);
    throw error;
  }
};

// Update application status
export const updateApplicationStatus = async (applicationId: string, status: string) => {
  try {
    console.log('🔄 Updating application status:', { applicationId, status });
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }
    
    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId);

    if (error) {
      console.error('❌ Database error updating application:', error);
      throw error;
    }
    
    console.log('✅ Updated application status successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Error updating application status:', error);
    throw error;
  }
};
