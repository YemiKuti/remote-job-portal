
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/api';

// Fetch recommended jobs based on user skills
export const fetchRecommendedJobs = async (userId: string, limit = 3) => {
  try {
    // In a real app, you would implement a recommendation algorithm
    // For now, we'll just fetch recent jobs
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .limit(limit);

    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Error fetching recommended jobs:', error);
    return [];
  }
};

// Fetch employer job listings
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
