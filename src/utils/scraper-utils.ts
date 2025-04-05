
import { Job } from "@/types";
import { jobs } from "@/data/jobs";
import { ScraperSettings } from "@/types/scraper";
import { format, parseISO, isAfter, isBefore, isWithinInterval } from "date-fns";

/**
 * Generate mock scraped jobs based on settings
 */
export const mockScrapedJobs = (settings: ScraperSettings) => {
  // Clone the original jobs
  let mockJobs = [...jobs].map(job => ({
    ...job,
    id: `scraped-${Math.random().toString(36).substring(2, 9)}`,
    postedDate: randomDateInRange(30),
    title: enhanceJobTitle(job.title, settings.keywords),
    description: enhanceJobDescription(job.description, settings.keywords),
  }));
  
  let filteredJobs = [...mockJobs];
  
  // Filter by company names if provided
  if (settings.companyNames.trim()) {
    const companyNameList = settings.companyNames.split(',').map(name => name.trim().toLowerCase());
    filteredJobs = filteredJobs.filter(job => 
      companyNameList.some(name => job.company.toLowerCase().includes(name))
    );
    
    // If no jobs match company filter, skip this filter
    if (filteredJobs.length === 0) {
      console.log("No jobs match company filter, skipping this filter");
      filteredJobs = [...mockJobs];
    }
  }
  
  // Filter by date range if provided
  if (settings.startDate || settings.endDate) {
    const dateFilteredJobs = filteredJobs.filter(job => {
      const jobDate = parseISO(job.postedDate);
      
      if (settings.startDate && settings.endDate) {
        return isWithinInterval(jobDate, { start: settings.startDate, end: settings.endDate });
      } else if (settings.startDate) {
        return isAfter(jobDate, settings.startDate) || jobDate.getTime() === settings.startDate.getTime();
      } else if (settings.endDate) {
        return isBefore(jobDate, settings.endDate) || jobDate.getTime() === settings.endDate.getTime();
      }
      
      return true;
    });
    
    // If no jobs match date filter, skip this filter
    if (dateFilteredJobs.length === 0) {
      console.log("No jobs match date filter, skipping this filter");
    } else {
      filteredJobs = dateFilteredJobs;
    }
  }
  
  // Filter by job types
  if (settings.jobTypes.length > 0) {
    const typeFilteredJobs = filteredJobs.filter(job => 
      settings.jobTypes.includes(job.employmentType)
    );
    
    // If no jobs match job type filter, skip this filter
    if (typeFilteredJobs.length === 0) {
      console.log("No jobs match job type filter, skipping this filter");
    } else {
      filteredJobs = typeFilteredJobs;
    }
  }
  
  // Filter by experience levels
  if (settings.experienceLevels.length > 0) {
    const expFilteredJobs = filteredJobs.filter(job => 
      settings.experienceLevels.includes(job.experienceLevel)
    );
    
    // If no jobs match experience level filter, skip this filter
    if (expFilteredJobs.length === 0) {
      console.log("No jobs match experience level filter, skipping this filter");
    } else {
      filteredJobs = expFilteredJobs;
    }
  }
  
  // Filter by salary range
  const salaryFilteredJobs = filteredJobs.filter(job => 
    job.salary.min >= settings.salaryRange.min && job.salary.max <= settings.salaryRange.max
  );
  
  // If no jobs match salary filter, skip this filter
  if (salaryFilteredJobs.length === 0) {
    console.log("No jobs match salary filter, skipping this filter");
  } else {
    filteredJobs = salaryFilteredJobs;
  }
  
  // Filter by remote option
  if (!settings.includeRemote) {
    const remoteFilteredJobs = filteredJobs.filter(job => !job.remote);
    
    // If no jobs match remote filter, skip this filter
    if (remoteFilteredJobs.length === 0) {
      console.log("No jobs match remote filter, skipping this filter");
    } else {
      filteredJobs = remoteFilteredJobs;
    }
  }
  
  // Filter by visa sponsorship
  if (!settings.includeVisaSponsorship) {
    const visaFilteredJobs = filteredJobs.filter(job => !job.visaSponsorship);
    
    // If no jobs match visa filter, skip this filter
    if (visaFilteredJobs.length === 0) {
      console.log("No jobs match visa filter, skipping this filter");
    } else {
      filteredJobs = visaFilteredJobs;
    }
  }
  
  // If after all filters we have no jobs, return at least some of the original jobs
  if (filteredJobs.length === 0) {
    console.log("No jobs match all filters, returning default jobs");
    filteredJobs = mockJobs.slice(0, Math.min(settings.jobLimit, 10));
  }
  
  // Limit the number of jobs
  filteredJobs = filteredJobs.slice(0, settings.jobLimit);
  
  // Generate stats for analytics
  const stats = generateJobStats(filteredJobs, settings);
  
  return {
    mockJobs: filteredJobs,
    stats
  };
};

/**
 * Generate analytics stats from jobs data
 */
const generateJobStats = (jobs: Job[], settings: ScraperSettings) => {
  // Jobs by source
  const bySource = settings.sources.map(source => ({
    name: source,
    value: Math.floor(Math.random() * jobs.length * 0.7) + 1
  }));
  
  // Ensure total matches jobs length
  let totalSourceJobs = bySource.reduce((sum, item) => sum + item.value, 0);
  if (totalSourceJobs !== jobs.length) {
    const diff = jobs.length - totalSourceJobs;
    bySource[0].value += diff;
  }
  
  // Jobs by experience level
  const byExperience = [
    { name: "Entry-level", value: 0 },
    { name: "Mid-level", value: 0 },
    { name: "Senior", value: 0 },
    { name: "Lead", value: 0 }
  ];
  
  jobs.forEach(job => {
    const expIdx = byExperience.findIndex(exp => exp.name === job.experienceLevel);
    if (expIdx >= 0) {
      byExperience[expIdx].value++;
    }
  });
  
  // Jobs by location
  const locations = [...new Set(jobs.map(job => job.location.split(',')[0].trim()))];
  const byLocation = locations.map(location => ({
    name: location,
    value: jobs.filter(job => job.location.includes(location)).length
  }));
  
  // Sort by value descending and limit to top 5
  byLocation.sort((a, b) => b.value - a.value);
  const topLocations = byLocation.slice(0, 5);
  
  // Jobs by salary range
  const bySalary = [
    { name: "0-50k", value: 0 },
    { name: "50k-100k", value: 0 },
    { name: "100k-150k", value: 0 },
    { name: "150k+", value: 0 }
  ];
  
  jobs.forEach(job => {
    const avgSalary = (job.salary.min + job.salary.max) / 2;
    if (avgSalary < 50000) bySalary[0].value++;
    else if (avgSalary < 100000) bySalary[1].value++;
    else if (avgSalary < 150000) bySalary[2].value++;
    else bySalary[3].value++;
  });
  
  return {
    bySource,
    byExperience,
    byLocation: topLocations,
    bySalary
  };
};

/**
 * Generate a random date within the last X days
 */
const randomDateInRange = (daysBack: number): string => {
  const today = new Date();
  const earliestDate = new Date();
  earliestDate.setDate(today.getDate() - daysBack);
  
  const randomTimestamp = earliestDate.getTime() + Math.random() * (today.getTime() - earliestDate.getTime());
  const randomDate = new Date(randomTimestamp);
  
  return randomDate.toISOString();
};

/**
 * Enhance job title with keywords
 */
const enhanceJobTitle = (title: string, keywords: string): string => {
  const keywordsList = keywords.split(',').map(k => k.trim());
  const specificKeywords = ['Africa', 'African', 'tech', 'developer'];
  
  // Only add Africa-related keywords to title
  const relevantKeywords = keywordsList.filter(keyword => 
    specificKeywords.includes(keyword) && !title.includes(keyword)
  );
  
  if (relevantKeywords.length > 0 && Math.random() > 0.5) {
    const keyword = relevantKeywords[Math.floor(Math.random() * relevantKeywords.length)];
    return `${title} (${keyword} Focus)`;
  }
  
  return title;
};

/**
 * Enhance job description with keywords
 */
const enhanceJobDescription = (description: string, keywords: string): string => {
  const keywordsList = keywords.split(',').map(k => k.trim());
  
  if (Math.random() > 0.3) {
    const enhancementPhrases = [
      "This position specifically targets African tech talent.",
      "We are actively seeking candidates from Africa for this role.",
      "This role offers opportunities for African developers.",
      "Part of our African tech talent initiative."
    ];
    
    const phrase = enhancementPhrases[Math.floor(Math.random() * enhancementPhrases.length)];
    return `${phrase} ${description}`;
  }
  
  return description;
};
