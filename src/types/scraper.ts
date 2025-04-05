
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
