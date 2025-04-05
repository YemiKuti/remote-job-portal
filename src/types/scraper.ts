
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
