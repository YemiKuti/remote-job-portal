
import { Job } from '@/types';

// Transform database job data to frontend Job type
export const transformDatabaseJobToFrontendJob = (dbJob: any): Job => {
  return {
    id: dbJob.id,
    title: dbJob.title,
    company: dbJob.company,
    logo: dbJob.logo || '/placeholder.svg',
    location: dbJob.location,
    salary: {
      min: dbJob.salary_min || 0,
      max: dbJob.salary_max || 0,
      currency: dbJob.salary_currency || 'USD',
    },
    description: dbJob.description,
    requirements: dbJob.requirements || [],
    postedDate: dbJob.posted_at || dbJob.created_at,
    employmentType: dbJob.employment_type as 'Full-time' | 'Part-time' | 'Contract' | 'Freelance',
    experienceLevel: dbJob.experience_level as 'Entry-level' | 'Mid-level' | 'Senior' | 'Lead',
    visaSponsorship: dbJob.visa_sponsorship || false,
    companySize: dbJob.company_size as 'Startup' | 'Small' | 'Medium' | 'Large' | 'Enterprise',
    techStack: dbJob.tech_stack || [],
    remote: dbJob.remote || false,
    applicationType: dbJob.application_type as 'internal' | 'external' | 'email' | 'phone' || 'internal',
    applicationValue: dbJob.application_value,
    applicationDeadline: dbJob.application_deadline,
    status: dbJob.status as 'active' | 'expired' | 'filled' | 'draft',
    isFeatured: dbJob.is_featured || false,
    sponsored: dbJob.sponsored || false,
    views: dbJob.views || 0,
    applications: dbJob.applications || 0,
    employerId: dbJob.employer_id,
  };
};
