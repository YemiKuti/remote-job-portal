
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
    
    // Fetch applications with explicit relationship hints to handle multiple foreign keys
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs(
          id,
          title,
          company,
          location
        ),
        candidate:profiles!applications_user_id_fkey(
          id,
          username,
          full_name
        )
      `)
      .eq('employer_id', userId)
      .order('applied_date', { ascending: false });

    if (appsError) {
      console.error('❌ Database error fetching applications:', appsError);
      throw appsError;
    }

    console.log(`✅ Found ${applications?.length || 0} applications for employer`);
    console.log('📊 Application details:', applications?.map(app => ({
      id: app.id,
      jobTitle: app.job?.title,
      candidateName: app.candidate?.full_name || app.candidate?.username,
      status: app.status
    })));
    
    return applications || [];
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
