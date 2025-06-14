
import { Job } from '../types';

interface XMLJob {
  id?: string;
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  requirements?: string[];
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  employmentType?: string;
  experienceLevel?: string;
  techStack?: string[];
  visaSponsorship?: boolean;
  remote?: boolean;
  companySize?: string;
  plugins?: string[];
}

export const parseXMLJobs = (xmlString: string): Job[] => {
  // Basic XML parsing - in a real implementation, you'd use a proper XML parser
  const jobs: Job[] = [];
  
  try {
    // This is a simplified parser - replace with proper XML parsing library
    const jobMatches = xmlString.match(/<job>(.*?)<\/job>/gs) || [];
    
    jobMatches.forEach((jobXML, index) => {
      const job: XMLJob = {};
      
      // Extract basic fields
      const titleMatch = jobXML.match(/<title>(.*?)<\/title>/s);
      const companyMatch = jobXML.match(/<company>(.*?)<\/company>/s);
      const locationMatch = jobXML.match(/<location>(.*?)<\/location>/s);
      const descriptionMatch = jobXML.match(/<description>(.*?)<\/description>/s);
      
      if (titleMatch) job.title = titleMatch[1].trim();
      if (companyMatch) job.company = companyMatch[1].trim();
      if (locationMatch) job.location = locationMatch[1].trim();
      if (descriptionMatch) job.description = descriptionMatch[1].trim();
      
      // Only create job if we have minimum required fields
      if (job.title && job.company && job.location) {
        const parsedJob: Job = {
          id: `xml-${index}`,
          title: job.title,
          company: job.company,
          logo: '/placeholder.svg',
          location: job.location,
          salary: {
            min: job.salary?.min || 0,
            max: job.salary?.max || 0,
            currency: job.salary?.currency || 'USD',
          },
          description: job.description || '',
          requirements: job.requirements || [],
          postedDate: new Date().toISOString(),
          employmentType: (job.employmentType as Job["employmentType"]) || 'Full-time',
          experienceLevel: (job.experienceLevel as Job["experienceLevel"]) || 'Mid-level',
          visaSponsorship: job.visaSponsorship || false,
          companySize: (job.companySize as Job["companySize"]) || 'Medium',
          techStack: job.techStack || [],
          remote: job.remote || false,
          applicationType: 'internal' as const,
          applicationValue: undefined,
          status: 'active' as const,
          isFeatured: false,
          views: 0,
          applications: 0,
          employerId: `xml-employer-${index}`,
          plugins: job.plugins || []
        } as Job;
        
        jobs.push(parsedJob);
      }
    });
    
  } catch (error) {
    console.error('Error parsing XML jobs:', error);
  }
  
  return jobs;
};

export const validateJobXML = (xmlString: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  try {
    // Basic validation - check for required fields
    const jobMatches = xmlString.match(/<job>(.*?)<\/job>/gs) || [];
    
    if (jobMatches.length === 0) {
      errors.push('No valid job entries found');
    }
    
    jobMatches.forEach((jobXML, index) => {
      const hasTitle = /<title>.*?<\/title>/s.test(jobXML);
      const hasCompany = /<company>.*?<\/company>/s.test(jobXML);
      const hasLocation = /<location>.*?<\/location>/s.test(jobXML);
      
      if (!hasTitle) errors.push(`Job ${index + 1}: Missing title`);
      if (!hasCompany) errors.push(`Job ${index + 1}: Missing company`);
      if (!hasLocation) errors.push(`Job ${index + 1}: Missing location`);
    });
    
  } catch (error) {
    errors.push('Invalid XML format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
