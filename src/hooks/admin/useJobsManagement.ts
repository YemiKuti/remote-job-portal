
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchAdminJobs, updateJobStatus } from "@/utils/api/adminApi";

interface AdminJob {
  id: string;
  title: string;
  company: string;
  location: string;
  created_at: string;
  status: string;
  applications: number;
}

export const useJobsManagement = () => {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
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
    
    loadJobs();
  }, [toast]);

  const handleJobAction = async (jobId: string, action: string) => {
    try {
      let newStatus = '';
      let successMessage = '';
      
      if (action === 'approve') {
        newStatus = 'active';
        successMessage = 'Job approved and published';
      } else if (action === 'reject') {
        newStatus = 'draft';
        successMessage = 'Job rejected and moved to draft';
      }
      
      if (newStatus) {
        console.log(`Updating job ${jobId} status to ${newStatus}`);
        
        const result = await updateJobStatus(jobId, newStatus);
        
        if (result.success) {
          // Update local state
          setJobs(jobs.map(job => 
            job.id === jobId 
              ? { ...job, status: newStatus } 
              : job
          ));
          
          toast({
            title: 'Success',
            description: successMessage,
          });
        } else {
          throw new Error('Update failed');
        }
      }
    } catch (error) {
      console.error(`Error performing action ${action}:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action} job. Please try again.`,
        variant: 'destructive',
      });
    }
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
    handleJobAction
  };
};
