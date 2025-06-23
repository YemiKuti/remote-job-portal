
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';

interface Job {
  id: string;
  title: string;
  applications: number | null;
  views: number | null;
  created_at: string | null;
  status: string;
  expires_at: string | null;
  posted_at: string | null;
}

export const useEmployerJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .select('id, title, applications, views, created_at, status, expires_at, posted_at')
          .eq('employer_id', user.id)
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
  }, [user, toast]);
  
  const handleJobAction = async (jobId: string, action: string) => {
    try {
      let updateData: { status?: string } = {};
      let successMessage = '';
      
      if (action === 'publish') {
        updateData.status = 'pending';
        successMessage = 'Job sent for approval';
      } else if (action === 'close') {
        updateData.status = 'expired';
        successMessage = 'Job closed successfully';
      } else if (action === 'reactivate') {
        updateData.status = 'pending';
        successMessage = 'Job reactivation request sent';
      } else if (action === 'delete') {
        const { error } = await supabase.from('jobs').delete().eq('id', jobId);
        if (error) throw error;
        
        setJobs(jobs.filter(job => job.id !== jobId));
        toast({
          title: 'Success',
          description: 'Job deleted successfully',
        });
        return;
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
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
  
  const activeJobs = filteredJobs.filter(job => job.status === 'active');
  const draftJobs = filteredJobs.filter(job => job.status === 'draft');
  const pendingJobs = filteredJobs.filter(job => job.status === 'pending');
  const closedJobs = filteredJobs.filter(job => ['expired', 'filled'].includes(job.status));
  
  return {
    jobs,
    activeJobs,
    draftJobs,
    pendingJobs,
    closedJobs,
    loading,
    searchTerm,
    setSearchTerm,
    handleJobAction,
  };
};
