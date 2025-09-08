import Papa from 'papaparse';

export interface ParsedJobData {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements?: string[];
  employment_type: string;
  experience_level: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  tech_stack?: string[];
  visa_sponsorship?: boolean;
  remote?: boolean;
  company_size?: string;
  application_deadline?: string;
  logo?: string;
  status?: string;
  application_type?: string;
  application_value?: string;
  employer_id?: string;
  sponsored?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
  isDuplicate?: boolean;
  duplicateKey?: string;
}

// Helper to truncate long descriptions
const truncateDescription = (description: string, maxLength: number = 2000): string => {
  if (description.length <= maxLength) return description;
  
  // Find the last complete sentence within the limit
  const truncated = description.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );
  
  if (lastSentenceEnd > maxLength * 0.8) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  
  // If no sentence break found, truncate at word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > maxLength * 0.8 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
};

// Generate duplicate key for comparison
const generateDuplicateKey = (job: ParsedJobData): string => {
  return `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}|${job.location.toLowerCase().trim()}`;
};

// Check for duplicates within the current batch
export const detectDuplicates = (jobs: ParsedJobData[]): Map<string, number[]> => {
  const duplicateMap = new Map<string, number[]>();
  const keyMap = new Map<string, number>();
  
  jobs.forEach((job, index) => {
    const key = generateDuplicateKey(job);
    
    if (keyMap.has(key)) {
      const firstIndex = keyMap.get(key)!;
      if (!duplicateMap.has(key)) {
        duplicateMap.set(key, [firstIndex]);
      }
      duplicateMap.get(key)!.push(index);
    } else {
      keyMap.set(key, index);
    }
  });
  
  return duplicateMap;
};

// Parse boolean values
const parseBoolean = (value: string): boolean => {
  if (!value) return false;
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
  if (!type) return 'full-time';
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
  
  return type; // Return as-is if no match
};

// Validate experience level
const validateExperienceLevel = (level: string): string => {
  if (!level) return 'mid';
  const normalized = level.toLowerCase().trim();
  const validLevels = {
    'entry': ['entry', 'entry-level', 'junior', 'graduate', 'fresh', '0-2', 'beginner'],
    'mid': ['mid', 'mid-level', 'intermediate', 'experienced', '2-5', '3-5'],
    'senior': ['senior', 'sr', 'lead', 'expert', '5+', 'advanced', '5-10'],
    'principal': ['principal', 'staff', 'architect', 'director', '10+']
  };
  
  for (const [validLevel, variations] of Object.entries(validLevels)) {
    if (variations.some(variation => normalized.includes(variation))) {
      return validLevel;
    }
  }
  
  return level; // Return as-is if no match
};

// Parse individual job row
const parseJobRow = (row: any): ParsedJobData => {
  const getField = (field: string): string => {
    return row[field]?.toString().trim() || '';
  };

  const title = getField('job title') || getField('title') || getField('position');
  const company = getField('company') || getField('company name');
  const location = getField('location') || getField('city');
  const description = getField('description') || getField('job description');
  const requirements = getField('requirements') || getField('qualifications');
  const employment_type = validateEmploymentType(getField('employment type') || getField('type'));
  const experience_level = validateExperienceLevel(getField('experience level') || getField('level'));
  const application_value = getField('application email') || getField('email') || getField('contact');

  return {
    title,
    company,
    location,
    description,
    requirements: requirements ? parseArray(requirements) : [],
    employment_type,
    experience_level,
    salary_min: parseSalary(getField('salary min') || getField('min salary')),
    salary_max: parseSalary(getField('salary max') || getField('max salary')),
    salary_currency: 'USD',
    tech_stack: parseArray(getField('tech stack') || getField('technologies')),
    visa_sponsorship: parseBoolean(getField('visa sponsorship') || getField('visa')),
    remote: parseBoolean(getField('remote')),
    company_size: getField('company size') || undefined,
    application_deadline: undefined,
    logo: undefined,
    status: 'active',
    application_type: application_value ? 'email' : 'internal',
    application_value: application_value || undefined,
    sponsored: true
  };
};

export const parseCSVFile = (file: File): Promise<ParsedJobData[]> => {
  return new Promise((resolve, reject) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      reject(new Error('File too large. Maximum size is 10MB.'));
      return;
    }
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header: string) => header.trim().toLowerCase(),
      complete: (results) => {
        try {
          if (results.errors.length > 0) {
            const criticalErrors = results.errors.filter(error => error.type === 'Delimiter');
            if (criticalErrors.length > 0) {
              reject(new Error('Invalid CSV format. Please check delimiters and try again.'));
              return;
            }
          }
          
          const jobs = results.data
            .filter((row: any) => row && Object.values(row).some(val => val && String(val).trim()))
            .map((row: any, index: number) => {
              try {
                const job = parseJobRow(row);
                // Truncate long descriptions
                job.description = truncateDescription(job.description);
                return job;
              } catch (error: any) {
                console.warn(`Skipping row ${index + 2}: ${error.message}`);
                return null;
              }
            })
            .filter(job => job !== null) as ParsedJobData[];
          
          resolve(jobs);
        } catch (error: any) {
          reject(error);
        }
      },
      error: (error: any) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    });
  });
};

export const validateJobData = (job: ParsedJobData, duplicateKey?: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields validation with more lenient checks
  if (!job.title || job.title.trim() === '' || job.title === 'Not specified') {
    errors.push('Job title is required');
  }
  
  if (!job.company || job.company.trim() === '' || job.company === 'Not specified') {
    errors.push('Company name is required');
  }
  
  if (!job.location || job.location.trim() === '') {
    warnings.push('Location not specified - using "Remote" as default');
  }
  
  if (!job.description || job.description.trim() === '' || job.description === 'Job description not provided') {
    warnings.push('Job description is missing or minimal');
  } else if (job.description.length > 2000) {
    warnings.push('Description was truncated to fit length limits');
  }
  
  // Employment type validation - more flexible
  const validEmploymentTypes = ['full-time', 'part-time', 'contract', 'temporary', 'internship'];
  if (job.employment_type && !validEmploymentTypes.includes(job.employment_type.toLowerCase())) {
    // Auto-correct common variations instead of erroring
    job.employment_type = 'full-time'; // Default fallback
    warnings.push(`Employment type was normalized to: ${job.employment_type}`);
  }
  
  // Experience level validation - more flexible
  const validExperienceLevels = ['entry', 'mid', 'senior', 'principal'];
  if (job.experience_level && !validExperienceLevels.includes(job.experience_level.toLowerCase())) {
    // Auto-correct common variations instead of erroring
    job.experience_level = 'mid'; // Default fallback
    warnings.push(`Experience level was normalized to: ${job.experience_level}`);
  }
  
  // Validate salary range
  if (job.salary_min && job.salary_max && job.salary_min > job.salary_max) {
    warnings.push('Minimum salary is greater than maximum salary - please verify');
    // Swap them if they're clearly reversed
    if (job.salary_min > job.salary_max * 2) {
      [job.salary_min, job.salary_max] = [job.salary_max, job.salary_min];
      warnings.push('Salary range was automatically corrected');
    }
  }
  
  // Validate application value (email or URL) - more lenient
  if (job.application_value) {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(job.application_value);
    const isUrl = /^https?:\/\/.+/.test(job.application_value);
    if (!isEmail && !isUrl) {
      // Try to fix common issues
      if (job.application_value.includes('@') && !job.application_value.includes('.')) {
        warnings.push('Application email may be missing domain extension');
      } else if (job.application_value.includes('www.') && !job.application_value.startsWith('http')) {
        job.application_value = 'https://' + job.application_value;
        warnings.push('Application URL was corrected to include protocol');
      } else {
        warnings.push('Application value should be a valid email or URL');
        // Don't error out, just warn
      }
    }
  }
  
  // Additional data quality checks
  if (job.title && job.title.length < 3) {
    warnings.push('Job title is very short');
  }
  
  if (job.company && job.company.length < 2) {
    warnings.push('Company name is very short');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    isDuplicate: !!duplicateKey,
    duplicateKey
  };
};

// Batch create jobs with progress tracking
export const createJobsBatch = async (
  jobs: ParsedJobData[], 
  onProgress?: (completed: number, total: number) => void
): Promise<{ successful: number; failed: number; errors: string[] }> => {
  console.log(`🚀 Starting batch upload of ${jobs.length} jobs`);
  
  const batchSize = 5; // Reduce batch size for better stability
  let successful = 0;
  let failed = 0;
  const errors: string[] = [];
  let processed = 0;
  
  for (let i = 0; i < jobs.length; i += batchSize) {
    const batch = jobs.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}: jobs ${i + 1} to ${Math.min(i + batchSize, jobs.length)}`);
    
    try {
      const promises = batch.map(async (job, batchIndex) => {
        const jobIndex = i + batchIndex;
        try {
          console.log(`📝 Creating job ${jobIndex + 1}: "${job.title}" at ${job.company}`);
          
          // Validate job data before sending
          const validation = validateJobData(job);
          if (!validation.isValid) {
            console.warn(`⚠️ Job ${jobIndex + 1} has validation errors:`, validation.errors);
            return { success: false, error: `Validation failed: ${validation.errors?.join(', ')}` };
          }
          
          // Ensure all required fields are present with defaults
          const jobData = {
            ...job,
            title: job.title || 'Job Title Not Specified',
            company: job.company || 'Company Not Specified', 
            location: job.location || 'Location Not Specified',
            description: job.description || 'Job description not provided.',
            employment_type: job.employment_type || 'full-time',
            experience_level: job.experience_level || 'mid',
            requirements: job.requirements || [],
            tech_stack: job.tech_stack || [],
            salary_currency: job.salary_currency || 'USD',
            visa_sponsorship: job.visa_sponsorship || false,
            remote: job.remote || false,
            status: 'active',
            sponsored: true
          };
          
          const { createAdminJob } = await import('@/utils/api/adminApi');
          const result = await createAdminJob(jobData);
          
          console.log(`✅ Job ${jobIndex + 1} created successfully:`, result);
          return { success: true, jobId: result };
        } catch (error: any) {
          console.error(`❌ Job ${jobIndex + 1} failed:`, error);
          return { 
            success: false, 
            error: error.message || 'Unknown error during job creation',
            jobTitle: job.title,
            jobCompany: job.company
          };
        }
      });
      
      const results = await Promise.all(promises);
      
      results.forEach((result, index) => {
        const jobIndex = i + index;
        processed++;
        
        if (result.success) {
          successful++;
          console.log(`✅ Job ${jobIndex + 1} uploaded successfully`);
        } else {
          failed++;
          const errorMsg = `Job ${jobIndex + 1} (${result.jobTitle || jobs[jobIndex].title} at ${result.jobCompany || jobs[jobIndex].company}): ${result.error}`;
          errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      });
      
      // Update progress
      if (onProgress) {
        onProgress(processed, jobs.length);
      }
      
      // Add a delay between batches to prevent overwhelming the database
      if (i + batchSize < jobs.length) {
        console.log(`⏱️ Waiting 200ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
    } catch (batchError: any) {
      console.error(`❌ Batch processing error:`, batchError);
      
      // Mark all jobs in this batch as failed
      batch.forEach((job, index) => {
        failed++;
        processed++;
        const jobIndex = i + index;
        const errorMsg = `Job ${jobIndex + 1} (${job.title} at ${job.company}): Batch failed - ${batchError.message}`;
        errors.push(errorMsg);
      });
      
      // Update progress even on batch failure
      if (onProgress) {
        onProgress(processed, jobs.length);
      }
    }
  }
  
  console.log(`🎯 Batch upload complete: ${successful} successful, ${failed} failed`);
  
  if (errors.length > 0) {
    console.error('❌ Upload errors:', errors);
  }
  
  return { successful, failed, errors };
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
      'Experience Level': 'Mid',
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