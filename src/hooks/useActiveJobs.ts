
import { useState, useEffect } from 'react';
import { Job } from '@/types';
import { fetchActiveJobs } from '@/utils/api/jobsApi';
import { transformDatabaseJobToFrontendJob } from '@/utils/jobTransformers';

export const useActiveJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const dbJobs = await fetchActiveJobs();
      const transformedJobs = dbJobs.map(transformDatabaseJobToFrontendJob);
      setJobs(transformedJobs);
    } catch (err: any) {
      console.error('Error loading jobs:', err);
      setError('Failed to load jobs. Please try again.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  return {
    jobs,
    loading,
    error,
    refetch: loadJobs,
  };
};
