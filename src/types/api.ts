
// Common interfaces for API data
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

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary_min: number;
  salary_max: number;
  employment_type: string;
  tech_stack: string[];
  status: string;
  created_at?: string;
  applications?: number;
  views?: number;
}
