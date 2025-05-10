
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface Application {
  id: string;
  job_id: string;
  user_id: string;
  status: string;
  applied_date: string;
  position?: string;
  company?: string;
  location?: string;
}

export interface SavedJob {
  id: string;
  job_id: string;
  user_id: string;
  saved_date: string;
  job?: {
    title: string;
    company: string;
    location: string;
    description: string;
    salary_min: number;
    salary_max: number;
    employment_type: string;
    tech_stack: string[];
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  sent_at: string;
  read: boolean;
  sender_name?: string;
  company?: string;
}

export interface Conversation {
  id: string;
  candidate_id: string;
  employer_id: string;
  last_message_at: string;
  unread_count: number;
  employer_name?: string;
  candidate_name?: string;
  company?: string;
  last_message?: string;
}

// Fetch candidate applications
export const fetchCandidateApplications = async (userId: string) => {
  try {
    // Get applications with job details using a join
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:job_id (
          title,
          company,
          location
        )
      `)
      .eq('user_id', userId)
      .order('applied_date', { ascending: false });

    if (error) throw error;

    // Format the data for the UI
    return data.map(app => ({
      id: app.id,
      job_id: app.job_id,
      user_id: app.user_id,
      status: app.status,
      applied_date: app.applied_date,
      position: app.job?.title,
      company: app.job?.company,
      location: app.job?.location
    }));
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return [];
  }
};

// Fetch saved jobs
export const fetchSavedJobs = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select(`
        *,
        job:job_id (*)
      `)
      .eq('user_id', userId)
      .order('saved_date', { ascending: false });

    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Error fetching saved jobs:', error);
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
      .eq('status', 'active')
      .limit(limit);

    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Error fetching recommended jobs:', error);
    return [];
  }
};

// Fetch conversations with latest messages
export const fetchConversations = async (userId: string, userRole: 'candidate' | 'employer') => {
  try {
    const idField = userRole === 'candidate' ? 'candidate_id' : 'employer_id';
    
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        employer:employer_id (username, full_name),
        candidate:candidate_id (username, full_name),
        company:employer_id (company_name)
      `)
      .eq(idField, userId)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    
    return data.map(conv => ({
      id: conv.id,
      candidate_id: conv.candidate_id,
      employer_id: conv.employer_id,
      last_message_at: conv.last_message_at,
      unread_count: conv.unread_count,
      employer_name: conv.employer?.full_name || conv.employer?.username,
      candidate_name: conv.candidate?.full_name || conv.candidate?.username,
      company: conv.company?.company_name,
      last_message: conv.last_message
    }));
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

// Fetch messages for a conversation
export const fetchMessages = async (conversationId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id (username, full_name)
      `)
      .eq('conversation_id', conversationId)
      .order('sent_at', { ascending: true });

    if (error) throw error;
    
    return data.map(msg => ({
      id: msg.id,
      conversation_id: msg.conversation_id,
      sender_id: msg.sender_id,
      recipient_id: msg.recipient_id,
      content: msg.content,
      sent_at: msg.sent_at,
      read: msg.read,
      sender_name: msg.sender?.full_name || msg.sender?.username
    }));
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

// Fetch employer job listings
export const fetchEmployerJobs = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Error fetching employer jobs:', error);
    return [];
  }
};

// Fetch candidate applications for an employer
export const fetchEmployerApplications = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:job_id (*),
        candidate:user_id (username, full_name)
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
