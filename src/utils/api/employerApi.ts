
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Fetch candidate applications for an employer
export const fetchEmployerApplications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs!job_id (*),
        candidate:profiles!user_id (username, full_name)
      `)
      .eq('employer_id', userId)
      .order('applied_date', { ascending: false });

    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Error fetching employer applications:', error);
    return [];
  }
};

// Fetch jobs created by an employer
export const fetchEmployerJobs = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Error fetching employer jobs:', error);
    return [];
  }
};
