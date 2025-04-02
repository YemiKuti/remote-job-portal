
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
