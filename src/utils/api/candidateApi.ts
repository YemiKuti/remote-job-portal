
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Application, SavedJob } from '@/types/api';

// Fetch candidate applications
export const fetchCandidateApplications = async (userId: string) => {
  try {
    // Fetch applications first
    const { data: applications, error: appError } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('applied_date', { ascending: false });

    if (appError) throw appError;

    // Fetch job details separately for each application
    const enhancedApplications: Application[] = [];
    
    for (const app of applications) {
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', app.job_id)
        .single();
        
      if (!jobError && jobData) {
        enhancedApplications.push({
          ...app,
          position: jobData.title,
          company: jobData.company,
          location: jobData.location
        });
      } else {
        enhancedApplications.push(app);
      }
    }

    return enhancedApplications;
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return [];
  }
};

// Fetch saved jobs
export const fetchSavedJobs = async (userId: string) => {
  try {
    // Get saved_jobs records
    const { data: savedJobRecords, error: savedJobError } = await supabase
      .from('saved_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('saved_date', { ascending: false });

    if (savedJobError) throw savedJobError;
    
    // Fetch job details for each saved job
    const savedJobs: SavedJob[] = [];
    
    for (const savedJob of savedJobRecords) {
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', savedJob.job_id)
        .single();
        
      if (!jobError && jobData) {
        savedJobs.push({
          ...savedJob,
          job: jobData
        });
      } else {
        savedJobs.push(savedJob);
      }
    }
    
    return savedJobs;
  } catch (error: any) {
    console.error('Error fetching saved jobs:', error);
    return [];
  }
};

// Save or unsave a job
export const toggleSaveJob = async (userId: string, jobId: string, currentlySaved: boolean) => {
  try {
    if (currentlySaved) {
      // Remove from saved jobs
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', userId)
        .eq('job_id', jobId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Job removed from saved jobs",
      });
    } else {
      // Add to saved jobs
      const { error } = await supabase
        .from('saved_jobs')
        .insert({
          user_id: userId,
          job_id: jobId,
          saved_date: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Job saved successfully",
      });
    }
    
    return true;
  } catch (error: any) {
    console.error('Error toggling saved job:', error);
    toast({
      title: "Error",
      description: "Failed to update saved jobs",
      variant: "destructive",
    });
    return false;
  }
};
