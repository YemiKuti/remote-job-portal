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

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  experienceLevel: string;
  employmentType: string;
  visaSponsorship: boolean;
  companySize: string;
  techStack: string[];
  postedDate: string;
  imageUrl: string;
}

export interface FeaturedCompany {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  websiteUrl: string;
}

export interface Testimonial {
  id: string;
  author: string;
  title: string;
  company: string;
  text: string;
  imageUrl: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
}

export interface Subscriber {
  id: string;
  user_id: string;
  email: string;
  stripe_customer_id: string;
  subscribed: boolean;
  subscription_tier: string;
  subscription_end: string;
  updated_at: string;
  created_at: string;
}

export interface Profile {
  id: string;
  updated_at: string;
  full_name: string;
  avatar_url: string;
  website: string;
  user_id: string;
}

export interface Blog {
  id: string;
  created_at: string;
  title: string;
  content: string;
  is_published: boolean;
  user_id: string;
}

export interface BlogPostDetails {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_published: boolean;
  profiles?: {
    full_name: string;
  };
}
