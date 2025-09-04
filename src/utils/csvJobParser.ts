import Papa from 'papaparse';

export interface ParsedJobData {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  employment_type: string;
  experience_level: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  tech_stack: string[];
  visa_sponsorship: boolean;
  remote: boolean;
  company_size?: string;
  application_deadline?: string;
  logo?: string;
  status: string;
  application_type: string;
  application_value?: string;
  sponsored: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

// Column mapping for flexible CSV headers
const COLUMN_MAPPINGS: Record<string, string[]> = {
  title: ['title', 'job title', 'position', 'job_title', 'role', 'job role'],
  company: ['company', 'company name', 'organization', 'employer', 'company_name'],
  location: ['location', 'city', 'address', 'place', 'workplace'],
  description: ['description', 'job description', 'details', 'summary', 'job_description'],
  requirements: ['requirements', 'qualifications', 'skills required', 'must have', 'job_requirements'],
  employment_type: ['employment type', 'type', 'job type', 'employment_type', 'work type'],
  experience_level: ['experience level', 'level', 'seniority', 'experience_level', 'career level'],
  salary_min: ['salary min', 'min salary', 'minimum salary', 'salary_min', 'min_salary'],
  salary_max: ['salary max', 'max salary', 'maximum salary', 'salary_max', 'max_salary'],
  tech_stack: ['tech stack', 'technologies', 'tech_stack', 'skills', 'technical skills'],
  remote: ['remote', 'remote work', 'work from home', 'is_remote'],
  application_value: ['application email', 'contact', 'email', 'apply to', 'application_email', 'contact_email'],
  company_size: ['company size', 'size', 'company_size', 'organization size'],
  visa_sponsorship: ['visa sponsorship', 'visa', 'sponsorship', 'visa_sponsorship']
};

// Normalize header names for mapping
const normalizeHeader = (header: string): string => {
  return header.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
};

// Map CSV headers to our job data structure
const mapHeaders = (headers: string[]): Record<string, number> => {
  const mappedHeaders: Record<string, number> = {};
  
  headers.forEach((header, index) => {
    const normalizedHeader = normalizeHeader(header);
    
    // Find matching field
    for (const [field, variations] of Object.entries(COLUMN_MAPPINGS)) {
      if (variations.some(variation => normalizedHeader.includes(variation))) {
        mappedHeaders[field] = index;
        break;
      }
    }
  });
  
  return mappedHeaders;
};

// Parse boolean values
const parseBoolean = (value: string): boolean => {
  const normalized = value.toLowerCase().trim();
  return ['true', 'yes', '1', 'y'].includes(normalized);
};

// Parse array values (comma or semicolon separated)
const parseArray = (value: string): string[] => {
  if (!value) return [];
  return value
    .split(/[,;]/)
    .map(item => item.trim())
    .filter(item => item.length > 0);
};

// Parse salary values
const parseSalary = (value: string): number | undefined => {
  if (!value) return undefined;
  const numericValue = value.replace(/[^0-9]/g, '');
  const parsed = parseInt(numericValue, 10);
  return isNaN(parsed) ? undefined : parsed;
};

// Validate employment type
const validateEmploymentType = (type: string): string => {
  const normalized = type.toLowerCase().trim();
  const validTypes = {
    'full-time': ['full-time', 'fulltime', 'full time', 'permanent', 'ft'],
    'part-time': ['part-time', 'parttime', 'part time', 'pt'],
    'contract': ['contract', 'contractor', 'temporary', 'temp', 'freelance'],
    'internship': ['internship', 'intern', 'graduate', 'trainee']
  };
  
  for (const [validType, variations] of Object.entries(validTypes)) {
    if (variations.includes(normalized)) {
      return validType;
    }
  }
  
  return 'Full-time'; // Default fallback
};

// Validate experience level
const validateExperienceLevel = (level: string): string => {
  const normalized = level.toLowerCase().trim();
  const validLevels = {
    'Entry-level': ['entry', 'entry-level', 'junior', 'graduate', 'fresh', '0-2', 'beginner'],
    'Mid-level': ['mid', 'mid-level', 'intermediate', 'experienced', '2-5', '3-5'],
    'Senior': ['senior', 'sr', 'lead', 'expert', '5+', 'advanced', '5-10'],
    'Lead': ['lead', 'principal', 'staff', 'architect', 'director', '10+']
  };
  
  for (const [validLevel, variations] of Object.entries(validLevels)) {
    if (variations.some(variation => normalized.includes(variation))) {
      return validLevel;
    }
  }
  
  return 'Mid-level'; // Default fallback
};

export const parseCSVFile = (file: File): Promise<ParsedJobData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
          return;
        }
        
        try {
          const data = results.data as any[];
          const headers = Object.keys(data[0] || {});
          const headerMap = mapHeaders(headers);
          
          const parsedJobs: ParsedJobData[] = data.map((row, index) => {
            const getField = (field: string): string => {
              const columnIndex = headerMap[field];
              if (columnIndex !== undefined) {
                const value = Object.values(row)[columnIndex] as string;
                return value?.toString().trim() || '';
              }
              return '';
            };
            
            const title = getField('title');
            const company = getField('company');
            const location = getField('location');
            const description = getField('description');
            const requirements = getField('requirements');
            const employment_type = validateEmploymentType(getField('employment_type'));
            const experience_level = validateExperienceLevel(getField('experience_level'));
            const application_value = getField('application_value');
            
            return {
              title,
              company,
              location,
              description,
              requirements: requirements ? parseArray(requirements) : [],
              employment_type,
              experience_level,
              salary_min: parseSalary(getField('salary_min')),
              salary_max: parseSalary(getField('salary_max')),
              salary_currency: 'USD',
              tech_stack: parseArray(getField('tech_stack')),
              visa_sponsorship: parseBoolean(getField('visa_sponsorship')),
              remote: parseBoolean(getField('remote')),
              company_size: getField('company_size') || undefined,
              application_deadline: undefined,
              logo: undefined,
              status: 'active',
              application_type: application_value ? 'email' : 'internal',
              application_value: application_value || undefined,
              sponsored: true
            };
          });
          
          resolve(parsedJobs);
        } catch (error: any) {
          reject(new Error(`Failed to process CSV data: ${error.message}`));
        }
      },
      error: (error) => {
        reject(new Error(`CSV file error: ${error.message}`));
      }
    });
  });
};

export const validateJobData = (job: ParsedJobData): ValidationResult => {
  const errors: string[] = [];
  
  // Required fields validation
  if (!job.title || job.title.length < 3) {
    errors.push('Job title is required (min 3 characters)');
  }
  
  if (!job.company || job.company.length < 2) {
    errors.push('Company name is required (min 2 characters)');
  }
  
  if (!job.location || job.location.length < 2) {
    errors.push('Location is required (min 2 characters)');
  }
  
  if (!job.description || job.description.length < 20) {
    errors.push('Description is required (min 20 characters)');
  }
  
  if (!job.employment_type) {
    errors.push('Employment type is required');
  }
  
  if (!job.experience_level) {
    errors.push('Experience level is required');
  }
  
  // Salary validation
  if (job.salary_min && job.salary_max && job.salary_min > job.salary_max) {
    errors.push('Minimum salary cannot be greater than maximum salary');
  }
  
  // Application method validation
  if (job.application_type === 'email' && job.application_value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(job.application_value)) {
      errors.push('Invalid email format for application contact');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
};

// Generate sample CSV content for download
export const generateSampleCSV = (): string => {
  const sampleData = [
    {
      'Job Title': 'Software Engineer',
      'Company': 'Tech Innovations Inc.',
      'Location': 'San Francisco, CA',
      'Description': 'We are looking for a talented Software Engineer to join our dynamic team. You will be responsible for developing high-quality applications and working with cutting-edge technologies.',
      'Requirements': 'JavaScript, React, Node.js, 3+ years experience',
      'Employment Type': 'Full-time',
      'Experience Level': 'Mid-level',
      'Salary Min': '80000',
      'Salary Max': '120000',
      'Tech Stack': 'React, Node.js, PostgreSQL, AWS',
      'Remote': 'true',
      'Application Email': 'jobs@techinnovations.com'
    },
    {
      'Job Title': 'Marketing Manager',
      'Company': 'Digital Marketing Solutions',
      'Location': 'New York, NY',
      'Description': 'Join our marketing team to lead digital campaigns and drive customer engagement. This role requires creativity and analytical skills.',
      'Requirements': 'Marketing degree, 5+ years experience, Google Analytics, SEO knowledge',
      'Employment Type': 'Full-time',
      'Experience Level': 'Senior',
      'Salary Min': '70000',
      'Salary Max': '95000',
      'Tech Stack': 'Google Analytics, HubSpot, Salesforce',
      'Remote': 'false',
      'Application Email': 'hr@digitalmarketing.com'
    }
  ];
  
  return Papa.unparse(sampleData);
};