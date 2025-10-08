import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CVJob {
  id: string;
  job_id: string;
  file_name: string;
  status: string;
  progress: number;
  error_message: string | null;
  tailored_content: string | null;
  created_at: string;
  processing_completed_at: string | null;
}

export const useCVJobTracking = (jobId: string | null) => {
  const [job, setJob] = useState<CVJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('cv_jobs')
          .select('*')
          .eq('job_id', jobId)
          .single();

        if (fetchError) throw fetchError;
        setJob(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching job:', err);
        setError(err.message);
      }
    };

    // Initial fetch
    fetchJob();

    // Set up real-time subscription
    const channel = supabase
      .channel('cv-job-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cv_jobs',
          filter: `job_id=eq.${jobId}`
        },
        (payload) => {
          console.log('Job update received:', payload);
          setJob(payload.new as CVJob);
        }
      )
      .subscribe();

    // Poll every 5 seconds as backup
    const interval = setInterval(fetchJob, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [jobId]);

  return { job, loading, error };
};
