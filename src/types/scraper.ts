
export interface JobScrapingSource {
  id: string;
  name: string;
  url: string;
  logo: string;
  features: string[];
  supported: boolean;
}

export interface ScraperSettings {
  keywords: string;
  companyNames: string;
  countries: string[];
  sources: string[];
  jobTypes: string[];
  experienceLevels: string[];
  salaryRange: {
    min: number;
    max: number;
  };
  includeRemote: boolean;
  includeVisaSponsorship: boolean;
  jobLimit: number;
  startDate?: Date;
  endDate?: Date;
  exportFormat: "json" | "xml" | "csv" | "excel";
  
  // Advanced settings
  depthCrawling: boolean;
  respectRobotsTxt: boolean;
  extractCompanyData: boolean;
  
  // AI settings
  useAI: boolean;
  aiEnhancement: boolean;
  similarJobDetection: boolean;
  companyInfoEnrichment: boolean;
  semanticSearch: boolean;
  structuredDataExtraction: boolean;
}

export interface ScrapedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  description?: string;
  postedDate: string;
  source: string;
  sourceUrl: string;
  jobType?: string;
  experienceLevel?: string;
  skills?: string[];
  isRemote?: boolean;
  isValidated: boolean;
}

export interface ScraperLog {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "debug";
  source: string;
  message: string;
}

export interface ScraperMetrics {
  jobsScraped: number;
  sourcesUsed: number;
  successRate: number;
  averageTime: number;
  lastRun?: Date;
  nextRun?: Date;
}
