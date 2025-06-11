
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
    
    // First, get applications for jobs owned by this employer
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select('*')
      .eq('employer_id', userId)
      .order('applied_date', { ascending: false });

    if (appsError) {
      console.error('❌ Database error fetching applications:', appsError);
      throw appsError;
    }

    if (!applications || applications.length === 0) {
      console.log('✅ No applications found for employer');
      return [];
    }

    // Get unique job IDs and user IDs
    const jobIds = [...new Set(applications.map(app => app.job_id))];
    const userIds = [...new Set(applications.map(app => app.user_id))];

    // Fetch job details
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, title, company, location')
      .in('id', jobIds);

    if (jobsError) {
      console.error('❌ Error fetching job details:', jobsError);
    }

    // Fetch candidate profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .in('id', userIds);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    }

    // Combine the data
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
    
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('❌ Database error fetching jobs:', error);
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
