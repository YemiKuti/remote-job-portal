
import { supabase } from '@/integrations/supabase/client';

// Fetch candidate applications for an employer
export const fetchEmployerApplications = async (userId: string) => {
  try {
    // Add a delay to prevent rapid successive calls
    await new Promise(resolve => setTimeout(resolve, 100));
    
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
      console.error('Database error fetching applications:', error);
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Error fetching employer applications:', error);
    // Don't return empty array on error, let the error bubble up
    throw error;
  }
};

// Fetch jobs created by an employer
export const fetchEmployerJobs = async (userId: string) => {
  try {
    // Add a delay to prevent rapid successive calls
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Database error fetching jobs:', error);
      throw error;
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Error fetching employer jobs:', error);
    // Don't return empty array on error, let the error bubble up
    throw error;
  }
};

// Update application status
export const updateApplicationStatus = async (applicationId: string, status: string) => {
  try {
    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId);

    if (error) {
      console.error('Database error updating application:', error);
      throw error;
    }
    
    return true;
  } catch (error: any) {
    console.error('Error updating application status:', error);
    throw error;
  }
};
