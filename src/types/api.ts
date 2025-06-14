
import { Job } from './index';

export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  saved_date: string;
  job: Job | null;
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
  job?: Job;
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
  views?: number;
  applications?: number;
  employer_id?: string;
}
