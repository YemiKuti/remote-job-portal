
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchAdminJobs } from "@/utils/api/adminApi";

interface AdminJob {
  id: string;
  title: string;
  company: string;
  location: string;
  created_at: string;
  status: string;
  applications: number;
  rejection_reason?: string;
  approval_date?: string;
  approved_by?: string;
  rejected_by?: string;
  rejection_date?: string;
  last_reviewed_at?: string;
  review_notes?: string;
}

export const useJobsManagement = () => {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      console.log('Loading admin jobs...');
      
      const data = await fetchAdminJobs();
      console.log('Admin jobs loaded:', data);
      
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching admin jobs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load jobs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJobAction = async () => {
    // Reload jobs after any action
    await loadJobs();
  };

  const filteredJobs = searchTerm.trim() === '' 
    ? jobs 
    : jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return {
    jobs: filteredJobs,
    loading,
    searchTerm,
    setSearchTerm,
    handleJobAction,
    reloadJobs: loadJobs
  };
};
