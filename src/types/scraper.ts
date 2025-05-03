
export interface ScraperSettings {
  countries: string[];
  keywords: string;
  companyNames: string;
  jobLimit: number;
  autoExport: boolean;
  schedule: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  sources: string[];
  jobTypes: string[];
  experienceLevels: string[];
  salaryRange: {
    min: number;
    max: number;
  };
  includeRemote: boolean;
  includeVisaSponsorship: boolean;
  exportFormat: string;
  // Advanced scraping settings
  useProxy: boolean;
  rotateUserAgent: boolean;
  captchaDetection: boolean;
  delayBetweenRequests: boolean;
  cleanData: boolean;
  // Source-specific settings
  depthCrawling: boolean;
  respectRobotsTxt: boolean;
  extractCompanyData: boolean;
  // Hirebase inspired settings
  useAI: boolean;
  aiEnhancement: boolean;
  similarJobDetection: boolean;
  companyInfoEnrichment: boolean;
  structuredDataExtraction: boolean;
  semanticSearch: boolean;
  // Features for social sharing and apply options
  enableSocialSharing: boolean;
  multipleApplyOptions: boolean;
  relatedJobsListing: boolean;
  candidateManagement: boolean;
  applicationDeadline: boolean;
  enhancedCompanyProfiles: boolean;
  advancedAnalytics: boolean;
  gdprCompliance: boolean;
}

export interface ScraperResultData {
  totalResults: number;
  sources: string[];
  dateScraped: string;
  stats: {
    bySource: {name: string; value: number}[];
    byExperience: {name: string; value: number}[];
    byLocation: {name: string; value: number}[];
    bySalary: {name: string; value: number}[];
  };
}

export interface JobScrapingSource {
  id: string;
  name: string;
  url: string;
  logo: string;
  features: string[];
  supported: boolean;
}

// Interface for the subscription plans
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'quarterly' | 'annual';
  features: string[];
  jobPostLimit: number;
  featuredJobsLimit: number;
}

export interface ApplyOption {
  type: 'internal' | 'external' | 'email' | 'phone';
  value: string;
  label: string;
}

export interface SocialLogin {
  provider: 'facebook' | 'linkedin' | 'google';
  enabled: boolean;
}

// New interfaces for job portal functionality

export interface UserRole {
  id: string;
  name: 'candidate' | 'employer' | 'admin';
  permissions: string[];
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  phoneNumber?: string;
  address?: string;
  socialProfiles?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export interface Candidate extends User {
  resume?: string;
  skills: string[];
  experienceLevel: string;
  education: Education[];
  workExperience: WorkExperience[];
  preferredJobTypes: string[];
  preferredLocations: string[];
  preferredSalaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  appliedJobs: string[];
  savedJobs: string[];
  followedCompanies: string[];
  profileCompleteness: number;
}

export interface Employer extends User {
  companyIds: string[];
  subscription?: SubscriptionPlan;
  subscriptionStatus: 'active' | 'expired' | 'canceled' | 'trial';
  subscriptionExpiresAt?: Date;
  postedJobs: string[];
  candidateInteractions: {
    viewed: string[];
    contacted: string[];
    invited: string[];
    rejected: string[];
  };
}

export interface Admin extends User {
  accessLevel: 'full' | 'limited';
  managedSections: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  isOngoing: boolean;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  isOngoing: boolean;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  description: string;
  website?: string;
  industry: string;
  size: string;
  founded?: number;
  headquarters: string;
  locations: string[];
  culture?: string;
  benefits?: string[];
  socialMediaLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  employerId: string;
  jobPostings: string[];
  followers: number;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  attachments?: string[];
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  scheduledTime: Date;
  duration: number; // in minutes
  location?: string; // can be physical or virtual
  meetingLink?: string;
  organizerId: string;
  participantIds: string[];
  status: 'scheduled' | 'canceled' | 'completed';
}

export interface JobApplication {
  id: string;
  jobId: string;
  candidateId: string;
  resumeUrl?: string;
  coverLetter?: string;
  appliedAt: Date;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  notes?: string;
  applyOption: ApplyOption;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'job_alert' | 'application_update' | 'message' | 'meeting';
  content: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface JobAlert {
  id: string;
  candidateId: string;
  keywords: string[];
  locations: string[];
  jobTypes: string[];
  frequency: 'daily' | 'weekly' | 'immediate';
  isActive: boolean;
}

export interface DashboardStats {
  recentActivity: {
    date: Date;
    action: string;
    details: string;
  }[];
  summary: {
    [key: string]: number;
  };
  charts: {
    type: string;
    data: any;
  }[];
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  subscriptionId?: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

