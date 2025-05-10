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
    
    // First get conversations
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq(idField, userId)
      .order('last_message_at', { ascending: false });

    if (convError) throw convError;
    
    // Then get user profiles for each conversation
    const enhancedConversations: Conversation[] = [];
    
    for (const conv of conversations) {
      // Get employer profile
      const { data: employerProfile, error: empError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', conv.employer_id)
        .single();
        
      // Get candidate profile
      const { data: candidateProfile, error: candError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', conv.candidate_id)
        .single();
        
      enhancedConversations.push({
        ...conv,
        employer_name: employerProfile && !empError ? employerProfile.full_name || employerProfile.username : 'Employer',
        candidate_name: candidateProfile && !candError ? candidateProfile.full_name || candidateProfile.username : 'Candidate',
        company: employerProfile && !empError ? employerProfile.company_name : undefined,
      });
    }
    
    return enhancedConversations;
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

// Fetch messages for a conversation
export const fetchMessages = async (conversationId: string) => {
  try {
    // Get messages
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('sent_at', { ascending: true });

    if (msgError) throw msgError;
    
    // Get sender profile for each message
    const enhancedMessages: Message[] = [];
    
    for (const msg of messages) {
      const { data: senderProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', msg.sender_id)
        .single();
        
      enhancedMessages.push({
        ...msg,
        sender_name: senderProfile && !profileError ? senderProfile.full_name || senderProfile.username : 'User'
      });
    }
    
    return enhancedMessages;
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
