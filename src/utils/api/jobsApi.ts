
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

// NOTE: Removed the duplicate fetchEmployerJobs function as it's now in employerApi.ts
