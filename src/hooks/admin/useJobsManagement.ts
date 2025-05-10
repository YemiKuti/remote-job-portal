
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('jobs')
          .select('id, title, company, location, created_at, status, applications')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setJobs(data || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load jobs. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [toast]);

  const handleJobAction = async (jobId: string, action: string) => {
    try {
      let updateData: { status?: string } = {};
      let successMessage = '';
      
      if (action === 'approve') {
        updateData.status = 'active';
        successMessage = 'Job approved and published';
      } else if (action === 'reject') {
        updateData.status = 'draft';
        successMessage = 'Job rejected and moved to draft';
      }
      
      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('jobs')
          .update(updateData)
          .eq('id', jobId);
        
        if (error) throw error;
        
        // Update local state
        setJobs(jobs.map(job => 
          job.id === jobId 
            ? { ...job, ...updateData } 
            : job
        ));
        
        toast({
          title: 'Success',
          description: successMessage,
        });
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
