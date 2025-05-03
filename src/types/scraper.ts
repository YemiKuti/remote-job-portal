
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

// Interface for the requested features
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
