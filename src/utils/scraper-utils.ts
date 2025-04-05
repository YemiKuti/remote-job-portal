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
    title: enhanceJobTitle(job.title, settings.keywords, settings.sustainabilityFocus),
    description: enhanceJobDescription(job.description, settings.keywords, settings.sustainabilityFocus),
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
  
  // New: Apply sustainability filters
  if (settings.sustainabilityFocus || settings.greenJobsOnly) {
    const sustainabilityKeywords = [
      'sustainability', 'sustainable', 'green', 'renewable', 'climate', 
      'environmental', 'eco', 'carbon', 'clean energy', 'solar', 'wind', 
      'esg', 'recycling', 'conservation', 'biodiversity'
    ];
    
    const sustainabilityFilteredJobs = filteredJobs.filter(job => {
      const jobText = `${job.title} ${job.description}`.toLowerCase();
      return sustainabilityKeywords.some(keyword => jobText.includes(keyword));
    });
    
    // For greenJobsOnly, strictly enforce this filter
    if (settings.greenJobsOnly) {
      filteredJobs = sustainabilityFilteredJobs;
      console.log(`After green jobs filtering: ${filteredJobs.length} jobs match`);
    } 
    // For sustainabilityFocus, only apply if we have matches
    else if (settings.sustainabilityFocus && sustainabilityFilteredJobs.length > 0) {
      filteredJobs = sustainabilityFilteredJobs;
      console.log(`After sustainability focus filtering: ${filteredJobs.length} jobs match`);
    } else if (settings.sustainabilityFocus) {
      console.log("No jobs match sustainability criteria, skipping this filter");
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
  
  // New: Add ESG scores if enabled
  if (settings.esgScoring) {
    filteredJobs = addESGScores(filteredJobs);
  }
  
  // New: Add carbon footprint data if enabled
  if (settings.carbonFootprintData) {
    filteredJobs = addCarbonFootprintData(filteredJobs);
  }
  
  // New: Highlight sustainable tech stacks
  if (settings.sustainableTechStack) {
    filteredJobs = highlightSustainableTech(filteredJobs);
  }
  
  // Fallback: If filtering was applied but no results, try to give relevant results
  if (filteringApplied && filteredJobs.length === 0) {
    console.log("No jobs match all filters, providing most relevant matches instead");
    
    // Create a scoring system to rank jobs by relevance to keywords and company names
    if (settings.keywords.trim() || settings.companyNames.trim() || settings.sustainabilityFocus) {
      const keywordsList = settings.keywords.split(',').map(keyword => keyword.trim().toLowerCase());
      const companyList = settings.companyNames.split(',').map(name => name.trim().toLowerCase());
      
      // Add sustainability keywords if that filter is enabled
      if (settings.sustainabilityFocus) {
        keywordsList.push(...['sustainability', 'green', 'renewable', 'climate', 'environmental']);
      }
      
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
 * Add ESG scores to companies in job listings
 */
const addESGScores = (jobs: Job[]): Job[] => {
  // Mock ESG data for companies - in real implementation this would come from an API
  const esgScores: {[company: string]: {score: number, rating: string}} = {
    'Google': {score: 85, rating: 'High ESG performer'},
    'Microsoft': {score: 88, rating: 'High ESG performer'},
    'Apple': {score: 82, rating: 'High ESG performer'},
    'Amazon': {score: 65, rating: 'Medium ESG performer'},
    'Meta': {score: 70, rating: 'Medium ESG performer'},
    'Tesla': {score: 75, rating: 'Medium ESG performer'},
    'IBM': {score: 80, rating: 'High ESG performer'},
    'Netflix': {score: 68, rating: 'Medium ESG performer'}
  };
  
  // Add ESG scores to job listings
  return jobs.map(job => {
    const companyName = Object.keys(esgScores).find(name => 
      job.company.toLowerCase().includes(name.toLowerCase())
    );
    
    if (companyName && esgScores[companyName]) {
      return {
        ...job,
        description: `${job.description}\n\nESG Score: ${esgScores[companyName].score}/100 - ${esgScores[companyName].rating}`
      };
    }
    
    // Generate a random ESG score for companies not in our database
    const randomScore = Math.floor(Math.random() * 30) + 50; // 50-80 range
    const rating = randomScore >= 75 ? 'High ESG performer' : 
                 randomScore >= 60 ? 'Medium ESG performer' : 'Low ESG performer';
                 
    return {
      ...job,
      description: `${job.description}\n\nESG Score: ${randomScore}/100 - ${rating}`
    };
  });
};

/**
 * Add carbon footprint data to job listings
 */
const addCarbonFootprintData = (jobs: Job[]): Job[] => {
  // Mock carbon data for industries - in real implementation this would come from an API
  const carbonData: {[industry: string]: string} = {
    'Tech': 'Low carbon footprint industry',
    'Energy': 'High carbon footprint industry, with renewable transitions underway',
    'Manufacturing': 'Medium-high carbon footprint industry',
    'Healthcare': 'Medium carbon footprint industry',
    'Finance': 'Low-medium carbon footprint industry',
    'Education': 'Low carbon footprint industry',
    'Retail': 'Medium carbon footprint industry'
  };
  
  // Add carbon footprint data to job listings
  return jobs.map(job => {
    // Determine industry from job title or description
    let industry = 'Tech'; // Default
    
    if (job.title.includes('Energy') || job.description.includes('energy sector')) {
      industry = 'Energy';
    } else if (job.title.includes('Manufacturing') || job.description.includes('manufacturing')) {
      industry = 'Manufacturing';
    } else if (job.title.includes('Health') || job.description.includes('healthcare')) {
      industry = 'Healthcare';
    } else if (job.title.includes('Finance') || job.description.includes('financial')) {
      industry = 'Finance';
    } else if (job.title.includes('Education') || job.description.includes('education')) {
      industry = 'Education';
    } else if (job.title.includes('Retail') || job.description.includes('retail')) {
      industry = 'Retail';
    }
    
    return {
      ...job,
      description: `${job.description}\n\nIndustry Carbon Impact: ${carbonData[industry]}`
    };
  });
};

/**
 * Highlight jobs with sustainable tech stacks
 */
const highlightSustainableTech = (jobs: Job[]): Job[] => {
  // Sustainable technologies
  const sustainableTech = [
    'renewable energy', 'solar', 'wind', 'geothermal', 'hydroelectric',
    'energy efficiency', 'green cloud', 'carbon accounting', 'emissions tracking',
    'python', 'r', 'data science', 'machine learning', 'api', 'golang',
    'sustainability reporting', 'esg data', 'lifecycle assessment'
  ];
  
  return jobs.map(job => {
    const techMatches = sustainableTech.filter(tech => 
      job.description.toLowerCase().includes(tech) || 
      job.techStack.some(t => t.toLowerCase().includes(tech))
    );
    
    if (techMatches.length > 0) {
      // Highlight this job as having sustainable tech
      return {
        ...job,
        description: `${job.description}\n\nSustainable Technologies: ${techMatches.join(', ')}`,
        title: `${job.title} 🌱` // Add a leaf emoji to indicate sustainable tech
      };
    }
    
    return job;
  });
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
 * Enhance job title with keywords - now ensures exact keyword usage and sustainability focus
 */
const enhanceJobTitle = (title: string, keywords: string, sustainabilityFocus: boolean): string => {
  if (!keywords.trim() && !sustainabilityFocus) return title;
  
  const keywordsList = keywords.split(',').map(k => k.trim());
  const specificKeywords = ['Africa', 'African', 'tech', 'developer', 'sustainability', 'green'];
  
  // Only add specific keywords to title if they're in the search
  const relevantKeywords = keywordsList.filter(keyword => 
    specificKeywords.includes(keyword) && !title.includes(keyword)
  );
  
  if (sustainabilityFocus && !title.toLowerCase().includes('sustainability') && 
      !title.toLowerCase().includes('green') && Math.random() > 0.7) {
    return `${title} (Sustainability Focus)`;
  }
  
  if (relevantKeywords.length > 0 && Math.random() > 0.5) {
    const keyword = relevantKeywords[Math.floor(Math.random() * relevantKeywords.length)];
    return `${title} (${keyword} Focus)`;
  }
  
  return title;
};

/**
 * Enhance job description with keywords - now ensures exact keyword usage and sustainability focus
 */
const enhanceJobDescription = (description: string, keywords: string, sustainabilityFocus: boolean): string => {
  if (!keywords.trim() && !sustainabilityFocus) return description;
  
  const keywordsList = keywords.split(',').map(k => k.trim());
  
  // Check if any African-related keywords are present
  const hasAfricanKeywords = keywordsList.some(k => 
    ['africa', 'african'].includes(k.toLowerCase())
  );
  
  // Add sustainability context if needed
  if (sustainabilityFocus && Math.random() > 0.4) {
    const sustainabilityPhrases = [
      "This position contributes to our organization's sustainability goals.",
      "We're looking for candidates passionate about environmental impact.",
      "This role helps drive our green initiatives forward.",
      "Join our team working on solutions for a more sustainable future.",
      "This position is part of our commitment to environmental stewardship."
    ];
    
    const phrase = sustainabilityPhrases[Math.floor(Math.random() * sustainabilityPhrases.length)];
    
    if (hasAfricanKeywords) {
      return `${phrase} Additionally, this position specifically targets African tech talent. ${description}`;
    }
    
    return `${phrase} ${description}`;
  }
  
  // Otherwise use the original African talent enhancement if those keywords are present
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
