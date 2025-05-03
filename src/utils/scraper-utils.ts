
import { Job } from "@/types";
import { ScraperSettings, ApplyOption } from "@/types/scraper";
import { jobs } from "@/data/jobs";

/**
 * Generates mock job data for the job scraper simulation
 * @param settings The scraper settings to use for filtering
 * @returns Object containing mock jobs and stats
 */
export const mockScrapedJobs = (settings: ScraperSettings) => {
  // Filter jobs based on settings
  const filteredJobs = jobs.filter(job => {
    // Basic keyword filtering
    if (settings.keywords && settings.keywords.trim().length > 0) {
      const keywordParts = settings.keywords.toLowerCase().split(',').map(k => k.trim());
      const jobText = `${job.title} ${job.company} ${job.description}`.toLowerCase();
      
      if (!keywordParts.some(keyword => jobText.includes(keyword))) {
        return false;
      }
    }
    
    // Company name filtering
    if (settings.companyNames && settings.companyNames.trim().length > 0) {
      const companyParts = settings.companyNames.toLowerCase().split(',').map(c => c.trim());
      const jobCompany = job.company.toLowerCase();
      
      if (!companyParts.some(company => jobCompany.includes(company))) {
        return false;
      }
    }
    
    // Source filtering
    if (settings.sources && settings.sources.length > 0) {
      // For demo, we randomly assign sources to jobs
      const jobSource = getRandomElement(settings.sources);
      if (!settings.sources.includes(jobSource)) {
        return false;
      }
    }
    
    // Job type filtering
    if (settings.jobTypes && settings.jobTypes.length > 0) {
      if (!settings.jobTypes.includes(job.employmentType)) {
        return false;
      }
    }
    
    // Experience level filtering
    if (settings.experienceLevels && settings.experienceLevels.length > 0) {
      if (!settings.experienceLevels.includes(job.experienceLevel)) {
        return false;
      }
    }
    
    // Salary range filtering
    if (settings.salaryRange) {
      if (job.salary.min < settings.salaryRange.min || job.salary.max > settings.salaryRange.max) {
        return false;
      }
    }
    
    // Remote job filtering
    if (settings.includeRemote === false && job.remote) {
      return false;
    }
    
    // Visa sponsorship filtering
    if (settings.includeVisaSponsorship === false && job.visaSponsorship) {
      return false;
    }
    
    return true;
  });
  
  // Limit the number of jobs based on the job limit setting
  const limitedJobs = filteredJobs.slice(0, settings.jobLimit);
  
  // Generate statistics
  const stats = {
    bySource: getStatsBySource(limitedJobs),
    byExperience: getStatsByExperience(limitedJobs),
    byLocation: getStatsByLocation(limitedJobs),
    bySalary: getStatsBySalary(limitedJobs)
  };
  
  // Apply enhanced features if enabled
  let enhancedJobs = [...limitedJobs];
  
  // Add multiple apply options if enabled
  if (settings.multipleApplyOptions) {
    enhancedJobs = enhancedJobs.map(job => ({
      ...job,
      applyOptions: getRandomApplyOptions()
    }));
  }
  
  // Add related job listings if enabled
  if (settings.relatedJobsListing) {
    enhancedJobs = enhancedJobs.map(job => ({
      ...job,
      relatedJobs: getRelatedJobs(job, filteredJobs, 3)
    }));
  }
  
  // Add application deadline if enabled
  if (settings.applicationDeadline) {
    enhancedJobs = enhancedJobs.map(job => ({
      ...job,
      applicationDeadline: getRandomFutureDate()
    }));
  }
  
  // Add company profile details if enabled
  if (settings.enhancedCompanyProfiles) {
    enhancedJobs = enhancedJobs.map(job => ({
      ...job,
      companyDetails: getEnhancedCompanyDetails(job.company)
    }));
  }
  
  // Add AI enhancement if enabled
  if (settings.useAI && settings.aiEnhancement) {
    enhancedJobs = enhancedJobs.map(job => ({
      ...job,
      description: enhanceDescription(job.description),
      enhancedSkillsMatch: getRandomSkillsMatch()
    }));
  }
  
  return {
    mockJobs: enhancedJobs,
    stats
  };
};

/**
 * Enhances job descriptions with AI-generated content
 */
const enhanceDescription = (description: string) => {
  // In a real implementation, this would use an AI service
  return description;
};

/**
 * Gets random apply options for a job
 */
const getRandomApplyOptions = () => {
  const options: ApplyOption[] = [];
  
  if (Math.random() > 0.3) {
    options.push({
      type: 'internal',
      value: 'apply_internal',
      label: 'Apply on our platform'
    });
  }
  
  if (Math.random() > 0.5) {
    options.push({
      type: 'external',
      value: 'https://example.com/apply',
      label: 'Apply on company website'
    });
  }
  
  if (Math.random() > 0.7) {
    options.push({
      type: 'email',
      value: 'careers@example.com',
      label: 'Apply by email'
    });
  }
  
  if (Math.random() > 0.8) {
    options.push({
      type: 'phone',
      value: '+1234567890',
      label: 'Apply by phone'
    });
  }
  
  return options;
};

/**
 * Gets related jobs for a job
 */
const getRelatedJobs = (currentJob: Job, allJobs: Job[], limit: number) => {
  // Filter out the current job and get random related jobs
  const otherJobs = allJobs.filter(job => job.id !== currentJob.id);
  return getRandomElements(otherJobs, Math.min(limit, otherJobs.length));
};

/**
 * Gets a random future date for application deadlines
 */
const getRandomFutureDate = () => {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(now.getDate() + Math.floor(Math.random() * 30) + 7);
  return futureDate.toISOString();
};

/**
 * Gets enhanced company details
 */
const getEnhancedCompanyDetails = (companyName: string) => {
  return {
    description: `${companyName} is a leading company in its field, focused on innovation and growth.`,
    culture: 'We promote diversity, collaboration, and continuous learning.',
    benefits: ['Healthcare', 'Flexible hours', 'Remote work options', '401k'],
    size: getRandomCompanySize(),
    founded: 2000 + Math.floor(Math.random() * 20),
    headquarters: getRandomLocation()
  };
};

/**
 * Gets random company size
 */
const getRandomCompanySize = () => {
  const sizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
  return sizes[Math.floor(Math.random() * sizes.length)];
};

/**
 * Gets random skills match percentage
 */
const getRandomSkillsMatch = () => {
  return Math.floor(Math.random() * 50) + 50;
};

/**
 * Helper function to get random elements from an array
 */
const getRandomElements = <T>(array: T[], count: number) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

/**
 * Helper function to get a random element from an array
 */
const getRandomElement = <T>(array: T[]) => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Gets random location
 */
const getRandomLocation = () => {
  const locations = [
    'New York, USA',
    'San Francisco, USA',
    'London, UK',
    'Berlin, Germany',
    'Toronto, Canada',
    'Sydney, Australia',
    'Singapore',
    'Tokyo, Japan'
  ];
  return locations[Math.floor(Math.random() * locations.length)];
};

/**
 * Generates statistics by source
 */
const getStatsBySource = (jobs: any[]) => {
  const sources = ['LinkedIn', 'Indeed', 'Glassdoor', 'Monster', 'StackOverflow'];
  return sources.map(source => ({
    name: source,
    value: Math.floor(Math.random() * jobs.length)
  }));
};

/**
 * Generates statistics by experience level
 */
const getStatsByExperience = (jobs: Job[]) => {
  const experienceLevels = ['Entry-level', 'Mid-level', 'Senior', 'Lead'];
  
  // Count jobs by experience level
  const counts: Record<string, number> = {};
  jobs.forEach(job => {
    counts[job.experienceLevel] = (counts[job.experienceLevel] || 0) + 1;
  });
  
  return experienceLevels.map(level => ({
    name: level,
    value: counts[level] || 0
  }));
};

/**
 * Generates statistics by location
 */
const getStatsByLocation = (jobs: Job[]) => {
  const locations = ['Remote', 'USA', 'Europe', 'Asia', 'Other'];
  
  return locations.map(location => {
    let count = 0;
    
    if (location === 'Remote') {
      count = jobs.filter(job => job.remote).length;
    } else if (location === 'USA') {
      count = jobs.filter(job => job.location.includes('USA')).length;
    } else if (location === 'Europe') {
      count = jobs.filter(job => 
        job.location.includes('UK') || 
        job.location.includes('Germany') ||
        job.location.includes('France')
      ).length;
    } else if (location === 'Asia') {
      count = jobs.filter(job => 
        job.location.includes('Japan') || 
        job.location.includes('Singapore') ||
        job.location.includes('India')
      ).length;
    } else {
      count = jobs.filter(job => 
        !job.remote && 
        !job.location.includes('USA') &&
        !job.location.includes('UK') &&
        !job.location.includes('Germany') &&
        !job.location.includes('France') &&
        !job.location.includes('Japan') &&
        !job.location.includes('Singapore') &&
        !job.location.includes('India')
      ).length;
    }
    
    return {
      name: location,
      value: count
    };
  });
};

/**
 * Generates statistics by salary range
 */
const getStatsBySalary = (jobs: Job[]) => {
  const salaryRanges = [
    { name: 'Under $50k', min: 0, max: 50000 },
    { name: '$50k-$100k', min: 50000, max: 100000 },
    { name: '$100k-$150k', min: 100000, max: 150000 },
    { name: 'Over $150k', min: 150000, max: Infinity }
  ];
  
  return salaryRanges.map(range => ({
    name: range.name,
    value: jobs.filter(job => job.salary.min >= range.min && job.salary.max < range.max).length
  }));
};
