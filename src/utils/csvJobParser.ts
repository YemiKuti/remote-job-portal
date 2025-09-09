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

// Generate duplicate key for comparison - more intelligent matching
const generateDuplicateKey = (job: ParsedJobData): string => {
  // Normalize text for better duplicate detection
  const normalize = (text: string): string => {
    return text.toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' '); // Normalize whitespace
  };
  
  const title = normalize(job.title || '');
  const company = normalize(job.company || '');
  const location = normalize(job.location || '');
  
  return `${title}|${company}|${location}`;
};

// Enhanced duplicate detection with similarity checking
export const detectDuplicates = (jobs: ParsedJobData[]): Map<string, number[]> => {
  const duplicateMap = new Map<string, number[]>();
  const keyMap = new Map<string, number>();
  const similarityThreshold = 0.9; // 90% similarity
  
  jobs.forEach((job, index) => {
    const key = generateDuplicateKey(job);
    
    // First check for exact matches
    if (keyMap.has(key)) {
      const firstIndex = keyMap.get(key)!;
      if (!duplicateMap.has(key)) {
        duplicateMap.set(key, [firstIndex]);
      }
      duplicateMap.get(key)!.push(index);
      return;
    }
    
    // Check for similar matches (for typos, etc.)
    let foundSimilar = false;
    for (const [existingKey, existingIndex] of keyMap.entries()) {
      if (calculateSimilarity(key, existingKey) > similarityThreshold) {
        if (!duplicateMap.has(existingKey)) {
          duplicateMap.set(existingKey, [existingIndex]);
        }
        duplicateMap.get(existingKey)!.push(index);
        foundSimilar = true;
        break;
      }
    }
    
    if (!foundSimilar) {
      keyMap.set(key, index);
    }
  });
  
  console.log(`🔍 Duplicate detection: found ${duplicateMap.size} duplicate groups out of ${jobs.length} jobs`);
  return duplicateMap;
};

// Simple string similarity calculation (Jaccard similarity)
const calculateSimilarity = (str1: string, str2: string): number => {
  const set1 = new Set(str1.split(''));
  const set2 = new Set(str2.split(''));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
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

// Enhanced job validation with more intelligent auto-fixing
export const validateJobData = (job: ParsedJobData, duplicateKey?: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Auto-fix common data issues before validation
  if (job.title) {
    job.title = job.title.trim();
    // Remove common prefixes/suffixes that might cause issues
    job.title = job.title.replace(/^(job[\s\-:]?|position[\s\-:]?|role[\s\-:]?)/i, '').trim();
    // Capitalize properly
    if (job.title.length > 0 && job.title === job.title.toLowerCase()) {
      job.title = job.title.replace(/\b\w/g, l => l.toUpperCase());
    }
  }
  
  if (job.company) {
    job.company = job.company.trim();
    // Capitalize properly if all lowercase
    if (job.company.length > 0 && job.company === job.company.toLowerCase()) {
      job.company = job.company.replace(/\b\w/g, l => l.toUpperCase());
    }
  }
  
  if (job.location) {
    job.location = job.location.trim();
    // Capitalize properly if all lowercase
    if (job.location.length > 0 && job.location === job.location.toLowerCase()) {
      job.location = job.location.replace(/\b\w/g, l => l.toUpperCase());
    }
  }
  
  // Required fields validation with smart defaults
  if (!job.title || job.title.trim() === '' || job.title === 'Not specified') {
    errors.push('Job title is required and cannot be empty');
  } else if (job.title.length < 3) {
    warnings.push('Job title is very short - consider adding more detail');
  } else if (job.title.length > 100) {
    job.title = job.title.substring(0, 97) + '...';
    warnings.push('Job title was truncated to 100 characters');
  }
  
  if (!job.company || job.company.trim() === '' || job.company === 'Not specified') {
    errors.push('Company name is required and cannot be empty');
  } else if (job.company.length < 2) {
    warnings.push('Company name is very short - consider adding more detail');
  } else if (job.company.length > 100) {
    job.company = job.company.substring(0, 97) + '...';
    warnings.push('Company name was truncated to 100 characters');
  }
  
  // Location handling with smart defaults
  if (!job.location || job.location.trim() === '') {
    job.location = 'Location Not Specified';
    warnings.push('Location was missing - set to "Location Not Specified"');
  } else if (job.location.toLowerCase().includes('remote') || job.location.toLowerCase().includes('anywhere')) {
    job.location = 'Remote';
    job.remote = true;
    warnings.push('Detected remote work - set remote flag to true');
  }
  
  // Description handling with auto-generation
  if (!job.description || job.description.trim() === '' || job.description === 'Job description not provided') {
    // Auto-generate basic description from available data
    const autoDesc = `We are looking for a ${job.title} to join ${job.company}${job.location !== 'Remote' ? ` in ${job.location}` : ' for a remote position'}.`;
    job.description = autoDesc;
    warnings.push('Job description was missing - generated a basic description from available data');
  } else {
    // Clean up description
    job.description = job.description.trim();
    
    // Check description quality
    if (job.description.length < 50) {
      warnings.push('Job description is quite short - consider adding more details about responsibilities and requirements');
    } else if (job.description.length > 2000) {
      job.description = truncateDescription(job.description, 2000);
      warnings.push('Job description was truncated to fit length limits (2000 characters)');
    }
    
    // Check for placeholder text and auto-fix
    const placeholderTexts = ['lorem ipsum', 'placeholder', 'job description here', 'to be determined', 'tbd', 'n/a'];
    if (placeholderTexts.some(placeholder => job.description.toLowerCase().includes(placeholder))) {
      const autoDesc = `We are seeking a qualified ${job.title} to join our team at ${job.company}. This is an excellent opportunity for professional growth in a dynamic work environment.`;
      job.description = autoDesc;
      warnings.push('Placeholder text detected in description - replaced with professional template');
    }
  }
  
  // Employment type validation - auto-correct common variations
  const validEmploymentTypes = ['full-time', 'part-time', 'contract', 'temporary', 'internship'];
  if (job.employment_type && !validEmploymentTypes.includes(job.employment_type.toLowerCase())) {
    const originalType = job.employment_type;
    job.employment_type = 'full-time'; // Default fallback
    warnings.push(`Employment type "${originalType}" was normalized to "${job.employment_type}"`);
  }
  
  // Experience level validation - auto-correct common variations
  const validExperienceLevels = ['entry', 'mid', 'senior', 'principal'];
  if (job.experience_level && !validExperienceLevels.includes(job.experience_level.toLowerCase())) {
    const originalLevel = job.experience_level;
    job.experience_level = 'mid'; // Default fallback
    warnings.push(`Experience level "${originalLevel}" was normalized to "${job.experience_level}"`);
  }
  
  // Salary validation with auto-correction
  if (job.salary_min && job.salary_max) {
    if (job.salary_min > job.salary_max) {
      // Check if they're clearly swapped
      if (job.salary_min > job.salary_max * 2) {
        [job.salary_min, job.salary_max] = [job.salary_max, job.salary_min];
        warnings.push('Salary range was swapped - minimum was greater than maximum');
      } else {
        warnings.push('Minimum salary is greater than maximum - please verify the salary range');
      }
    }
    
    // Check for unrealistic salaries
    if (job.salary_min < 1000) {
      warnings.push('Minimum salary seems very low - please verify the amount');
    }
    if (job.salary_max > 1000000) {
      warnings.push('Maximum salary seems very high - please verify the amount');
    }
  }
  
  // Application value validation - more lenient with auto-correction
  if (job.application_value) {
    const trimmedValue = job.application_value.trim();
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // URL validation  
    const urlRegex = /^https?:\/\/.+/;
    
    if (emailRegex.test(trimmedValue)) {
      // Valid email
      job.application_value = trimmedValue;
    } else if (urlRegex.test(trimmedValue)) {
      // Valid URL
      job.application_value = trimmedValue;
    } else if (trimmedValue.includes('@')) {
      // Might be an email missing domain
      if (!trimmedValue.includes('.')) {
        warnings.push('Application email may be missing domain extension (e.g., .com)');
      } else {
        warnings.push('Application email format may be invalid');
      }
    } else if (trimmedValue.includes('www.') || trimmedValue.includes('.com') || trimmedValue.includes('.org')) {
      // Might be a URL missing protocol
      if (!trimmedValue.startsWith('http')) {
        job.application_value = 'https://' + trimmedValue;
        warnings.push('Application URL was corrected to include https:// protocol');
      }
    } else {
      warnings.push('Application value should be a valid email address or URL');
    }
  }
  
  // Tech stack validation
  if (job.tech_stack && job.tech_stack.length > 20) {
    job.tech_stack = job.tech_stack.slice(0, 20);
    warnings.push('Tech stack was trimmed to 20 items for better readability');
  }
  
  // Requirements validation
  if (job.requirements && job.requirements.length > 15) {
    job.requirements = job.requirements.slice(0, 15);
    warnings.push('Requirements list was trimmed to 15 items for better readability');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    isDuplicate: !!duplicateKey,
    duplicateKey
  };
};

// Enhanced batch create jobs with better error handling and progress tracking
export const createJobsBatch = async (
  jobs: ParsedJobData[], 
  onProgress?: (completed: number, total: number) => void
): Promise<{ successful: number; failed: number; errors: string[] }> => {
  console.log(`🚀 Starting batch upload of ${jobs.length} jobs`);
  
  // Validate inputs
  if (!jobs || jobs.length === 0) {
    console.error('❌ No jobs provided for batch upload');
    return { successful: 0, failed: 0, errors: ['No jobs provided for upload'] };
  }

  if (jobs.length > 1000) {
    console.warn(`⚠️ Large batch detected: ${jobs.length} jobs. Consider splitting into smaller batches.`);
  }
  
  const batchSize = 3; // Reduce batch size for better stability
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
          
          console.log('📋 Job data being sent:', {
            title: jobData.title,
            company: jobData.company,
            status: jobData.status,
            employer_id: jobData.employer_id
          });
          
          console.log('🔄 Importing createAdminJob...');
          const { createAdminJob } = await import('@/utils/api/adminApi');
          console.log('✅ createAdminJob imported successfully');
          
          // Additional validation before API call
          if (!jobData.title || !jobData.company) {
            throw new Error('Job title and company are required');
          }

          if (jobData.title.length > 200) {
            console.warn(`⚠️ Job title too long, truncating: ${jobData.title}`);
            jobData.title = jobData.title.substring(0, 197) + '...';
          }

          if (jobData.company.length > 100) {
            console.warn(`⚠️ Company name too long, truncating: ${jobData.company}`);
            jobData.company = jobData.company.substring(0, 97) + '...';
          }
          
          const result = await createAdminJob(jobData);
          
          if (!result) {
            throw new Error('No response from admin job creation');
          }
          
          console.log(`✅ Job ${jobIndex + 1} created successfully with ID:`, result);
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