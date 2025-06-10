export interface Job {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  postedDate: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance';
  experienceLevel: 'Entry-level' | 'Mid-level' | 'Senior' | 'Lead';
  visaSponsorship: boolean;
  companySize: 'Startup' | 'Small' | 'Medium' | 'Large' | 'Enterprise';
  techStack: string[];
  remote: boolean;
  // New fields for enhanced job features
  applicationDeadline?: string;
  applyOptions?: {
    type: 'internal' | 'external' | 'email' | 'phone';
    value: string;
    label: string;
  }[];
  relatedJobs?: string[];
  companyDetails?: {
    description: string;
    culture: string;
    benefits: string[];
    size: string;
    founded: number;
    headquarters: string;
  };
  status: 'active' | 'expired' | 'filled' | 'draft';
  isFeatured: boolean;
  views: number;
  applications: number;
  employerId: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface SearchFilters {
  query: string;
  location: string;
  experienceLevel: string;
  visaSponsorship: boolean | null;
  companySize: string;
  employmentType: string;
  techStack: string[];
  minSalary: number | null;
  hideKeywords: string[];
}

// Additional types for job portal functionality
export interface Resume {
  id: string;
  candidateId: string;
  title: string;
  fileUrl: string;
  fileType: 'pdf' | 'doc' | 'docx';
  uploadDate: Date;
  isDefault: boolean;
}

export interface Review {
  id: string;
  reviewerId: string;
  targetId: string;
  targetType: 'company' | 'candidate';
  rating: number;
  comment: string;
  date: Date;
}

export interface JobCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  jobCount: number;
}

export interface CompanyCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  skills: string[];
}

export interface CandidateFilter {
  location?: string[];
  skills?: string[];
  experienceLevel?: string[];
  education?: string[];
  jobType?: string[];
  availability?: string[];
}

export interface BlogPostDetails {
  id: string;
  title: string;
  content: string;
  featured_image?: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_published: boolean;
  profiles?: {
    full_name: string | null;
  } | null;
}

export interface RelatedPostDetails {
  id: string;
  title: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
  } | null;
}
