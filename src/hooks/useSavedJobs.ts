
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { fetchSavedJobs, toggleSaveJob } from '@/utils/api/candidateApi';
import { SavedJob } from '@/types/api';

export const useSavedJobs = () => {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSavedJobs = async () => {
      if (!user) return;
      
      setLoading(true);
      const jobs = await fetchSavedJobs(user.id);
      setSavedJobs(jobs);
      setLoading(false);
    };
    
    loadSavedJobs();
  }, [user]);

  const isJobSaved = (jobId: string) => {
    return savedJobs.some(savedJob => savedJob.job_id === jobId);
  };

  const handleToggleSave = async (jobId: string) => {
    if (!user) return false;
    
    const currentlySaved = isJobSaved(jobId);
    
    // Optimistic update
    if (currentlySaved) {
      setSavedJobs(prev => prev.filter(job => job.job_id !== jobId));
    } else {
      // Add a temporary saved job entry for optimistic UI
      const tempSavedJob: SavedJob = {
        id: `temp-${jobId}`,
        user_id: user.id,
        job_id: jobId,
        saved_date: new Date().toISOString(),
        job: null // Will be populated when we refresh
      };
      setSavedJobs(prev => [...prev, tempSavedJob]);
    }
    
    const success = await toggleSaveJob(user.id, jobId, currentlySaved);
    
    if (!success) {
      // Revert optimistic update on failure
      if (currentlySaved) {
        // Re-add the job if unsave failed
        const tempSavedJob: SavedJob = {
          id: `temp-${jobId}`,
          user_id: user.id,
          job_id: jobId,
          saved_date: new Date().toISOString(),
          job: null
        };
        setSavedJobs(prev => [...prev, tempSavedJob]);
      } else {
        // Remove the job if save failed
        setSavedJobs(prev => prev.filter(job => job.job_id !== jobId));
      }
    }
    
    return success;
  };

  return {
    savedJobs,
    loading,
    isJobSaved,
    handleToggleSave
  };
};
