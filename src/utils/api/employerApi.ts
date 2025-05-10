
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

// Fetch candidate applications for an employer
export const fetchEmployerApplications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs!job_id (*),
        candidate:profiles!user_id (username, full_name)
      `)
      .eq('employer_id', userId)
      .order('applied_date', { ascending: false });

    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Error fetching employer applications:', error);
    return [];
  }
};

// Update application status
export const updateApplicationStatus = async (applicationId: string, status: string) => {
  try {
    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId);

    if (error) throw error;
    
    toast({
      title: "Success",
      description: "Application status updated",
    });
    
    return true;
  } catch (error: any) {
    console.error('Error updating application status:', error);
    toast({
      title: "Error",
      description: "Failed to update application status",
      variant: "destructive",
    });
    return false;
  }
};
