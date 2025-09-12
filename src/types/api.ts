export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  saved_date: string;
  job: any | null; // Make this more flexible to handle database job format
}

export interface Application {
  id: string;
  user_id: string;
  job_id: string;
  employer_id: string;
  applied_date: string;
  status: 'pending' | 'reviewing' | 'interview' | 'rejected' | 'accepted' | 'withdrawn';
  cover_letter?: string;
  portfolio_url?: string;
  additional_notes?: string;
  resume_id?: string;
  job?: any; // Make this more flexible to handle database job format
}

export interface TailoredResume {
  id: string;
  user_id: string;
  original_resume_id?: string;
  job_id?: string;
  tailored_content: string;
  ai_suggestions?: any;
  accepted_suggestions?: any;
  tailoring_score?: number;
  created_at: string;
  updated_at: string;
  job?: Job;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  logo?: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  description: string;
  requirements: string[];
  created_at: string;
  updated_at?: string;
  employment_type: string;
  experience_level: string;
  visa_sponsorship?: boolean;
  company_size?: string;
  tech_stack: string[];
  remote?: boolean;
  application_type: string;
  application_value?: string;
  application_deadline?: string;
  status: string;
  is_featured?: boolean;
  sponsored?: boolean;
  views?: number;
  applications?: number;
  employer_id?: string;
  // Database-specific fields that need mapping
  approval_date?: string;
  approved_by?: string;
  rejected_by?: string;
  rejection_date?: string;
  rejection_reason?: string;
  review_notes?: string;
  last_reviewed_at?: string;
  posted_at?: string;
  expires_at?: string;
  days_valid?: number;
  is_verified?: boolean;
}

export interface Conversation {
  id: string;
  candidate_id: string;
  employer_id: string;
  job_id?: string;
  last_message?: string;
  last_message_at: string;
  unread_count: number;
  created_at: string;
  candidate_name?: string;
  employer_name?: string;
  company?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content?: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_size?: number;
  sent_at: string;
  read: boolean;
  seen: boolean;
  sender_name?: string;
}
