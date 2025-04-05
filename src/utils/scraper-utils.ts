
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
  let filteringApplied = false;
  
  // Apply keyword filtering with exact matching
  if (settings.keywords.trim()) {
    filteringApplied = true;
    const keywordsList = settings.keywords.split(',').map(keyword => keyword.trim().toLowerCase());
    
    // Strict exact matching for keywords
    filteredJobs = filteredJobs.filter(job => {
      // For each keyword, check if it appears exactly in title or description
      return keywordsList.some(keyword => {
        const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'i');
        return keywordRegex.test(job.title) || keywordRegex.test(job.description);
      });
    });
    
    console.log(`After keyword filtering: ${filteredJobs.length} jobs match`);
  }
  
  // Filter by company names with exact matching
  if (settings.companyNames.trim()) {
    filteringApplied = true;
    const companyNameList = settings.companyNames.split(',').map(name => name.trim().toLowerCase());
    
    // Strict exact matching for company names
    const companyFilteredJobs = filteredJobs.filter(job => {
      return companyNameList.some(name => {
        const companyRegex = new RegExp(`\\b${name}\\b`, 'i');
        return companyRegex.test(job.company);
      });
    });
    
    // Only apply this filter if we have matches
    if (companyFilteredJobs.length > 0) {
      filteredJobs = companyFilteredJobs;
      console.log(`After company filtering: ${filteredJobs.length} jobs match`);
    } else {
      console.log("No jobs match company filter exactly, skipping this filter");
    }
  }
  
  // Apply other filters, but keep track of when filters eliminate all results
  
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
    
    if (dateFilteredJobs.length > 0) {
      filteredJobs = dateFilteredJobs;
      console.log(`After date filtering: ${filteredJobs.length} jobs match`);
    } else {
      console.log("No jobs match date filter, skipping this filter");
    }
  }
  
  // Filter by job types
  if (settings.jobTypes.length > 0) {
    const typeFilteredJobs = filteredJobs.filter(job => 
      settings.jobTypes.includes(job.employmentType)
    );
    
    if (typeFilteredJobs.length > 0) {
      filteredJobs = typeFilteredJobs;
      console.log(`After job type filtering: ${filteredJobs.length} jobs match`);
    } else {
      console.log("No jobs match job type filter, skipping this filter");
    }
  }
  
  // Filter by experience levels
  if (settings.experienceLevels.length > 0) {
    const expFilteredJobs = filteredJobs.filter(job => 
      settings.experienceLevels.includes(job.experienceLevel)
    );
    
    if (expFilteredJobs.length > 0) {
      filteredJobs = expFilteredJobs;
      console.log(`After experience level filtering: ${filteredJobs.length} jobs match`);
    } else {
      console.log("No jobs match experience level filter, skipping this filter");
    }
  }
  
  // Filter by salary range
  const salaryFilteredJobs = filteredJobs.filter(job => 
    job.salary.min >= settings.salaryRange.min && job.salary.max <= settings.salaryRange.max
  );
  
  if (salaryFilteredJobs.length > 0) {
    filteredJobs = salaryFilteredJobs;
    console.log(`After salary filtering: ${filteredJobs.length} jobs match`);
  } else {
    console.log("No jobs match salary filter, skipping this filter");
  }
  
  // Filter by remote option
  if (!settings.includeRemote) {
    const remoteFilteredJobs = filteredJobs.filter(job => !job.remote);
    
    if (remoteFilteredJobs.length > 0) {
      filteredJobs = remoteFilteredJobs;
      console.log(`After remote filtering: ${filteredJobs.length} jobs match`);
    } else {
      console.log("No jobs match remote filter, skipping this filter");
    }
  }
  
  // Filter by visa sponsorship
  if (!settings.includeVisaSponsorship) {
    const visaFilteredJobs = filteredJobs.filter(job => !job.visaSponsorship);
    
    if (visaFilteredJobs.length > 0) {
      filteredJobs = visaFilteredJobs;
      console.log(`After visa filtering: ${filteredJobs.length} jobs match`);
    } else {
      console.log("No jobs match visa filter, skipping this filter");
    }
  }
  
  // New: Clean data if the option is enabled
  if (settings.cleanData) {
    filteredJobs = cleanJobData(filteredJobs);
    console.log(`After data cleaning: ${filteredJobs.length} jobs`);
  }
  
  // Fallback: If filtering was applied but no results, try to give relevant results
  if (filteringApplied && filteredJobs.length === 0) {
    console.log("No jobs match all filters, providing most relevant matches instead");
    
    // Create a scoring system to rank jobs by relevance to keywords and company names
    if (settings.keywords.trim() || settings.companyNames.trim()) {
      const keywordsList = settings.keywords.split(',').map(keyword => keyword.trim().toLowerCase());
      const companyList = settings.companyNames.split(',').map(name => name.trim().toLowerCase());
      
      // Score each job based on how well it matches the search criteria
      const scoredJobs = mockJobs.map(job => {
        let score = 0;
        
        // Score keywords matches
        keywordsList.forEach(keyword => {
          if (keyword && keyword.length > 2) { // Only consider meaningful keywords
            // Check for partial matches
            if (job.title.toLowerCase().includes(keyword)) score += 3;
            if (job.description.toLowerCase().includes(keyword)) score += 2;
            // Check for exact matches (worth more)
            const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'i');
            if (keywordRegex.test(job.title)) score += 5;
            if (keywordRegex.test(job.description)) score += 3;
          }
        });
        
        // Score company matches
        companyList.forEach(company => {
          if (company && company.length > 2) { // Only consider meaningful company names
            // Check for partial matches
            if (job.company.toLowerCase().includes(company)) score += 3;
            // Check for exact matches (worth more)
            const companyRegex = new RegExp(`\\b${company}\\b`, 'i');
            if (companyRegex.test(job.company)) score += 5;
          }
        });
        
        return { job, score };
      });
      
      // Sort by score and take top results
      scoredJobs.sort((a, b) => b.score - a.score);
      // Only return jobs with at least some relevance
      const relevantJobs = scoredJobs.filter(item => item.score > 0).map(item => item.job);
      
      if (relevantJobs.length > 0) {
        filteredJobs = relevantJobs.slice(0, settings.jobLimit);
        console.log(`Providing ${filteredJobs.length} relevant jobs based on scoring algorithm`);
      } else {
        // If still no relevant jobs, return a subset of mock jobs
        filteredJobs = mockJobs.slice(0, Math.min(settings.jobLimit, 5));
        console.log("No relevant jobs found, returning sample jobs");
      }
    } else {
      // If no keywords or companies specified, return a subset of mock jobs
      filteredJobs = mockJobs.slice(0, Math.min(settings.jobLimit, 10));
      console.log("No keywords or companies specified, returning sample jobs");
    }
  }
  
  // Limit the number of jobs
  filteredJobs = filteredJobs.slice(0, settings.jobLimit);
  console.log(`Final result: ${filteredJobs.length} jobs`);
  
  // Generate stats for analytics
  const stats = generateJobStats(filteredJobs, settings);
  
  return {
    mockJobs: filteredJobs,
    stats
  };
};

/**
 * Clean job data - new function to handle data cleaning
 * - Standardize job titles
 * - Remove duplicates
 * - Format inconsistencies
 */
const cleanJobData = (jobs: Job[]): Job[] => {
  // Map of standardized titles
  const titleStandardizations: {[key: string]: string} = {
    "Sr": "Senior",
    "Jr": "Junior",
    "Dev": "Developer",
    "Eng": "Engineer",
    "SWE": "Software Engineer",
    "UI/UX": "UI/UX Designer",
    "FE": "Frontend",
    "BE": "Backend"
  };
  
  // Step 1: Standardize job titles
  const standardizedJobs = jobs.map(job => {
    let standardizedTitle = job.title;
    
    // Apply each standardization
    Object.entries(titleStandardizations).forEach(([shortForm, fullForm]) => {
      // Use word boundary regex to only replace whole words
      const regex = new RegExp(`\\b${shortForm}\\b`, 'g');
      standardizedTitle = standardizedTitle.replace(regex, fullForm);
    });
    
    return {
      ...job,
      title: standardizedTitle
    };
  });
  
  // Step 2: Remove duplicate jobs (based on title and company)
  const uniqueJobsMap = new Map();
  standardizedJobs.forEach(job => {
    const key = `${job.title}-${job.company}`;
    if (!uniqueJobsMap.has(key) || 
        parseISO(job.postedDate) > parseISO(uniqueJobsMap.get(key).postedDate)) {
      uniqueJobsMap.set(key, job);
    }
  });
  
  // Convert map back to array
  return Array.from(uniqueJobsMap.values());
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
 * Enhance job title with keywords - now ensures exact keyword usage
 */
const enhanceJobTitle = (title: string, keywords: string): string => {
  if (!keywords.trim()) return title;
  
  const keywordsList = keywords.split(',').map(k => k.trim());
  const specificKeywords = ['Africa', 'African', 'tech', 'developer'];
  
  // Only add Africa-related keywords to title if they're in the search
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
 * Enhance job description with keywords - now ensures exact keyword usage
 */
const enhanceJobDescription = (description: string, keywords: string): string => {
  if (!keywords.trim()) return description;
  
  const keywordsList = keywords.split(',').map(k => k.trim());
  
  // Check if any African-related keywords are present
  const hasAfricanKeywords = keywordsList.some(k => 
    ['africa', 'african'].includes(k.toLowerCase())
  );
  
  if (hasAfricanKeywords && Math.random() > 0.3) {
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
