
import { supabase } from '@/integrations/supabase/client';

// Fetch candidate applications for an employer
export const fetchEmployerApplications = async (userId: string) => {
  try {
    console.log('🔄 Fetching employer applications for user:', userId);
    
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs!job_id (*),
        candidate:profiles!user_id (username, full_name)
      `)
      .eq('employer_id', userId)
      .order('applied_date', { ascending: false });

    if (error) {
      console.error('❌ Database error fetching applications:', error);
      throw error;
    }
    
    console.log('✅ Fetched applications:', data?.length || 0);
    return data || [];
  } catch (error: any) {
    console.error('❌ Error fetching employer applications:', error);
    throw error;
  }
};

// Fetch jobs created by an employer
export const fetchEmployerJobs = async (userId: string) => {
  try {
    console.log('🔄 Fetching employer jobs for user:', userId);
    
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
