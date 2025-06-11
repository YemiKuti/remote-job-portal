
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
    
    // Try to fetch applications with basic query first
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select('*')
      .eq('employer_id', userId)
      .order('applied_date', { ascending: false });

    if (appsError) {
      console.error('❌ Database error fetching applications:', appsError);
      // If we get permission denied, return empty array instead of throwing
      if (appsError.code === 'PGRST301' || appsError.message?.includes('permission denied')) {
        console.log('⚠️ Permission denied for applications, returning empty array');
        return [];
      }
      throw appsError;
    }

    if (!applications || applications.length === 0) {
      console.log('✅ No applications found for employer');
      return [];
    }

    console.log(`✅ Found ${applications.length} applications, fetching related data...`);

    // Get unique job IDs and user IDs
    const jobIds = [...new Set(applications.map(app => app.job_id))];
    const userIds = [...new Set(applications.map(app => app.user_id))];

    // Fetch job details with error handling
    let jobs = [];
    try {
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title, company, location')
        .in('id', jobIds);

      if (jobsError) {
        console.error('❌ Error fetching job details:', jobsError);
        jobs = [];
      } else {
        jobs = jobsData || [];
      }
    } catch (error) {
      console.error('❌ Exception fetching jobs:', error);
      jobs = [];
    }

    // Fetch candidate profiles with error handling
    let profiles = [];
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
        profiles = [];
      } else {
        profiles = profilesData || [];
      }
    } catch (error) {
      console.error('❌ Exception fetching profiles:', error);
      profiles = [];
    }

    // Combine the data with fallbacks
    const enrichedApplications = applications.map(app => {
      const job = jobs?.find(j => j.id === app.job_id);
      const candidate = profiles?.find(p => p.id === app.user_id);
      
      return {
        ...app,
        job: job || { title: 'Unknown Job', company: 'Unknown', location: 'Unknown' },
        candidate: candidate || { username: 'Unknown', full_name: 'Unknown Candidate' }
      };
    });
    
    console.log('✅ Fetched applications:', enrichedApplications.length);
    return enrichedApplications;
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
