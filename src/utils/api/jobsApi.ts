
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/api';

// Fetch all active jobs for public job listings
export const fetchActiveJobs = async () => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'live') // Only show approved/live jobs
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data || [];
  } catch (error: any) {
    console.error('Error fetching active jobs:', error);
    return [];
  }
};

// Fetch recommended jobs based on user skills
export const fetchRecommendedJobs = async (userId: string, limit = 3) => {
  try {
    // In a real app, you would implement a recommendation algorithm
    // For now, we'll just fetch recent jobs
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'live')
      .limit(limit);

    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Error fetching recommended jobs:', error);
    return [];
  }
};

// NOTE: Removed the duplicate fetchEmployerJobs function as it's now in employerApi.ts
