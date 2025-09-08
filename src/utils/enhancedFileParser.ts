import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ParsedJobData, ValidationResult } from './csvJobParser';

export interface RawRowData {
  [key: string]: any;
}

export interface ParsedFileData {
  headers: string[];
  rows: RawRowData[];
  totalRows: number;
  fileName: string;
  fileType: 'csv' | 'xlsx';
}

export interface HeaderMapping {
  [originalHeader: string]: string;
}

export interface FileParseResult {
  success: boolean;
  data?: ParsedFileData;
  error?: string;
}

// Common header mappings for intelligent detection
const HEADER_MAPPINGS: Record<string, string[]> = {
  'title': ['job title', 'title', 'position', 'job position', 'role', 'job role'],
  'company': ['company', 'company name', 'employer', 'organization'],
  'location': ['location', 'city', 'address', 'workplace', 'office location'],
  'description': ['description', 'job description', 'job summary', 'details', 'about'],
  'requirements': ['requirements', 'qualifications', 'skills required', 'must have'],
  'employment_type': ['employment type', 'type', 'job type', 'position type', 'contract type'],
  'experience_level': ['experience level', 'level', 'seniority', 'experience', 'career level'],
  'salary_min': ['salary min', 'min salary', 'minimum salary', 'salary from', 'pay min'],
  'salary_max': ['salary max', 'max salary', 'maximum salary', 'salary to', 'pay max'],
  'salary_currency': ['currency', 'salary currency', 'pay currency'],
  'tech_stack': ['tech stack', 'technologies', 'technical skills', 'tools', 'programming languages'],
  'remote': ['remote', 'remote work', 'work from home', 'wfh', 'telecommute'],
  'visa_sponsorship': ['visa sponsorship', 'visa', 'sponsorship', 'visa support'],
  'application_value': ['application email', 'email', 'contact email', 'apply email', 'application link', 'apply link', 'url']
};

// Remove BOM from text
const removeBOM = (text: string): string => {
  return text.replace(/^\uFEFF/, '');
};

// Detect file type by MIME and extension
export const detectFileType = (file: File): 'csv' | 'xlsx' | 'unsupported' => {
  const extension = file.name.toLowerCase().split('.').pop();
  const mimeType = file.type.toLowerCase();
  
  // Check XLSX first
  if (extension === 'xlsx' || 
      mimeType.includes('spreadsheet') || 
      mimeType.includes('excel')) {
    return 'xlsx';
  }
  
  // Check CSV
  if (extension === 'csv' || 
      mimeType.includes('csv') || 
      mimeType.includes('text/plain')) {
    return 'csv';
  }
  
  return 'unsupported';
};

// Parse CSV file with enhanced error handling
const parseCSVFile = async (file: File): Promise<ParsedFileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        let text = e.target?.result as string;
        text = removeBOM(text);
        
        // Try to detect delimiter
        const sampleLines = text.split('\n').slice(0, 5).join('\n');
        const commaCount = (sampleLines.match(/,/g) || []).length;
        const semicolonCount = (sampleLines.match(/;/g) || []).length;
        const delimiter = semicolonCount > commaCount ? ';' : ',';
        
        Papa.parse(text, {
          header: true,
          delimiter: delimiter,
          skipEmptyLines: 'greedy',
          transformHeader: (header: string) => header.trim().toLowerCase(),
          complete: (results) => {
            if (results.errors.length > 0) {
              const criticalErrors = results.errors.filter(
                error => error.type === 'Delimiter' || error.type === 'Quotes'
              );
              if (criticalErrors.length > 0) {
                reject(new Error(`CSV parsing error: ${criticalErrors[0].message}`));
                return;
              }
            }
            
            const validRows = results.data.filter((row: any) => 
              row && Object.values(row).some(val => val && String(val).trim())
            );
            
            if (validRows.length === 0) {
              reject(new Error('No valid data found in CSV file'));
              return;
            }
            
            const headers = Object.keys(validRows[0] || {});
            
            resolve({
              headers,
              rows: validRows,
              totalRows: validRows.length,
              fileName: file.name,
              fileType: 'csv'
            });
          },
          error: (error) => {
            reject(new Error(`CSV parse error: ${error.message}`));
          }
        });
      } catch (error: any) {
        reject(new Error(`Failed to read CSV: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file, 'UTF-8');
  });
};

// Parse XLSX file
const parseXLSXFile = async (file: File): Promise<ParsedFileData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Use the first sheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          reject(new Error('No sheets found in Excel file'));
          return;
        }
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          raw: false 
        }) as any[][];
        
        if (jsonData.length < 2) {
          reject(new Error('Excel file must have at least a header row and one data row'));
          return;
        }
        
        // First row is headers
        const rawHeaders = jsonData[0];
        const headers = rawHeaders.map((h: any) => String(h || '').trim().toLowerCase());
        
        // Convert remaining rows to objects
        const rows = jsonData.slice(1)
          .filter(row => row.some(cell => cell && String(cell).trim()))
          .map(row => {
            const obj: RawRowData = {};
            headers.forEach((header, index) => {
              if (header) {
                obj[header] = row[index] || '';
              }
            });
            return obj;
          });
        
        if (rows.length === 0) {
          reject(new Error('No valid data rows found in Excel file'));
          return;
        }
        
        resolve({
          headers: headers.filter(h => h),
          rows,
          totalRows: rows.length,
          fileName: file.name,
          fileType: 'xlsx'
        });
      } catch (error: any) {
        reject(new Error(`Failed to parse Excel file: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Enhanced file parser that handles both CSV and XLSX with improved error handling
export const parseFile = async (file: File): Promise<FileParseResult> => {
  try {
    console.log(`🔄 Starting file parse: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: 'File too large. Maximum size is 10MB. Please reduce the file size or split your data into smaller files.'
      };
    }
    
    // Check if file is empty
    if (file.size === 0) {
      return {
        success: false,
        error: 'File is empty. Please upload a file with job data.'
      };
    }
    
    const fileType = detectFileType(file);
    console.log(`📋 Detected file type: ${fileType}`);
    
    if (fileType === 'unsupported') {
      return {
        success: false,
        error: 'Unsupported file format. Please upload a .csv or .xlsx file with job data.'
      };
    }
    
    let data: ParsedFileData;
    
    try {
      if (fileType === 'csv') {
        data = await parseCSVFile(file);
      } else {
        data = await parseXLSXFile(file);
      }
    } catch (parseError: any) {
      console.error('❌ File parsing failed:', parseError);
      return {
        success: false,
        error: `Failed to parse ${fileType.toUpperCase()} file: ${parseError.message}. Please check the file format and try again.`
      };
    }
    
    // Validate we have some headers
    if (!data.headers || data.headers.length === 0) {
      return {
        success: false,
        error: 'No valid headers found in file. Please ensure your file has a header row with column names like "Job Title", "Company", "Location", etc.'
      };
    }
    
    // Check for minimum required columns
    const headerText = data.headers.join(' ').toLowerCase();
    const hasJobTitle = headerText.includes('job') || headerText.includes('title') || headerText.includes('position');
    const hasCompany = headerText.includes('company') || headerText.includes('employer');
    
    if (!hasJobTitle && !hasCompany) {
      return {
        success: false,
        error: 'File appears to be missing essential job columns. Please ensure your file has columns like "Job Title" and "Company".'
      };
    }
    
    // Validate we have actual data
    if (!data.rows || data.rows.length === 0) {
      return {
        success: false,
        error: 'No data rows found in file. Please ensure your file contains job data below the header row.'
      };
    }
    
    // Limit to 1000 rows for performance
    if (data.totalRows > 1000) {
      return {
        success: false,
        error: 'File contains too many rows (maximum 1000). Please split your file into smaller batches for better performance.'
      };
    }
    
    // Check for completely empty rows and filter them out
    const validRows = data.rows.filter(row => 
      Object.values(row).some(value => value && String(value).trim().length > 0)
    );
    
    if (validRows.length === 0) {
      return {
        success: false,
        error: 'All data rows appear to be empty. Please check your file and ensure it contains job information.'
      };
    }
    
    if (validRows.length !== data.rows.length) {
      console.log(`📊 Filtered out ${data.rows.length - validRows.length} empty rows`);
      data.rows = validRows;
      data.totalRows = validRows.length;
    }
    
    console.log(`✅ File parsed successfully: ${data.totalRows} rows, ${data.headers.length} columns`);
    
    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error('❌ Unexpected error during file parsing:', error);
    return {
      success: false,
      error: `Unexpected error: ${error.message || 'Failed to parse file'}. Please try again or contact support if the problem persists.`
    };
  }
};

// Generate intelligent header mapping suggestions
export const generateHeaderMapping = (headers: string[]): HeaderMapping => {
  const mapping: HeaderMapping = {};
  
  headers.forEach(header => {
    const normalizedHeader = header.toLowerCase().trim();
    
    // Find best match for this header
    for (const [targetField, variations] of Object.entries(HEADER_MAPPINGS)) {
      if (variations.some(variation => 
        normalizedHeader.includes(variation) || variation.includes(normalizedHeader)
      )) {
        mapping[header] = targetField;
        break;
      }
    }
    
    // If no match found, keep original
    if (!mapping[header]) {
      mapping[header] = header;
    }
  });
  
  return mapping;
};

// Convert mapped data to ParsedJobData format
export const convertToJobData = (
  rows: RawRowData[], 
  headerMapping: HeaderMapping
): ParsedJobData[] => {
  return rows.map((row, rowIndex) => {
    const mappedRow: any = {};
    
    // Apply header mapping
    Object.entries(row).forEach(([originalHeader, value]) => {
      const mappedHeader = headerMapping[originalHeader];
      if (mappedHeader && value !== null && value !== undefined) {
        const cleanValue = String(value).trim();
        if (cleanValue) {
          mappedRow[mappedHeader] = cleanValue;
        }
      }
    });
    
    // Parse and validate individual fields with better defaults
    const getField = (field: string): string => {
      const value = mappedRow[field] || '';
      return typeof value === 'string' ? value.trim() : String(value).trim();
    };
    
    const parseBoolean = (value: string): boolean => {
      if (!value) return false;
      const normalized = value.toLowerCase().trim();
      return ['true', 'yes', '1', 'y', 'on', 'enabled'].includes(normalized);
    };
    
    const parseArray = (value: string): string[] => {
      if (!value) return [];
      return value.split(/[,;|\n]/).map(item => item.trim()).filter(item => item.length > 0);
    };
    
    const parseSalary = (value: string): number | undefined => {
      if (!value) return undefined;
      // Remove currency symbols and non-numeric characters except decimal points
      const numericValue = value.replace(/[^\d.]/g, '');
      const parsed = parseFloat(numericValue);
      return isNaN(parsed) || parsed <= 0 ? undefined : Math.floor(parsed);
    };
    
    const normalizeEmploymentType = (type: string): string => {
      if (!type) return 'full-time';
      const normalized = type.toLowerCase().trim();
      const typeMap: Record<string, string> = {
        'fulltime': 'full-time',
        'full time': 'full-time',
        'permanent': 'full-time',
        'ft': 'full-time',
        'parttime': 'part-time', 
        'part time': 'part-time',
        'pt': 'part-time',
        'contractor': 'contract',
        'freelance': 'contract',
        'temporary': 'contract',
        'temp': 'contract',
        'intern': 'internship',
        'graduate': 'internship'
      };
      return typeMap[normalized] || (normalized.includes('part') ? 'part-time' : 
             normalized.includes('contract') || normalized.includes('freelance') ? 'contract' :
             normalized.includes('intern') ? 'internship' : type);
    };
    
    const normalizeExperienceLevel = (level: string): string => {
      if (!level) return 'mid';
      const normalized = level.toLowerCase().trim();
      const levelMap: Record<string, string> = {
        'junior': 'entry',
        'graduate': 'entry',
        'fresh': 'entry',
        'beginner': 'entry',
        'entry-level': 'entry',
        'intermediate': 'mid',
        'middle': 'mid',
        'experienced': 'mid',
        'sr': 'senior',
        'lead': 'senior',
        'expert': 'senior',
        'advanced': 'senior',
        'staff': 'principal',
        'architect': 'principal',
        'director': 'principal'
      };
      return levelMap[normalized] || (normalized.includes('junior') || normalized.includes('entry') ? 'entry' :
             normalized.includes('senior') || normalized.includes('lead') ? 'senior' :
             normalized.includes('principal') || normalized.includes('architect') ? 'principal' : level);
    };
    
    // Extract and clean field values
    const title = getField('title') || 'Not specified';
    const company = getField('company') || 'Not specified';
    const location = getField('location') || 'Remote';
    const description = getField('description') || 'Job description not provided';
    const employmentType = normalizeEmploymentType(getField('employment_type'));
    const experienceLevel = normalizeExperienceLevel(getField('experience_level'));
    
    // Truncate description if too long
    const truncateDescription = (desc: string): string => {
      if (desc.length <= 2000) return desc;
      const truncated = desc.substring(0, 1900);
      const lastSpace = truncated.lastIndexOf(' ');
      return (lastSpace > 1800 ? truncated.substring(0, lastSpace) : truncated) + '...';
    };
    
    try {
      return {
        title,
        company,
        location,
        description: truncateDescription(description),
        requirements: parseArray(getField('requirements')),
        employment_type: employmentType,
        experience_level: experienceLevel,
        salary_min: parseSalary(getField('salary_min')),
        salary_max: parseSalary(getField('salary_max')),
        salary_currency: getField('salary_currency') || 'USD',
        tech_stack: parseArray(getField('tech_stack')),
        visa_sponsorship: parseBoolean(getField('visa_sponsorship')),
        remote: parseBoolean(getField('remote')),
        company_size: getField('company_size') || undefined,
        application_deadline: undefined,
        logo: undefined,
        status: 'active',
        application_type: getField('application_value') ? 'email' : 'internal',
        application_value: getField('application_value') || undefined,
        sponsored: true
      } as ParsedJobData;
    } catch (error: any) {
      console.warn(`Error parsing row ${rowIndex + 1}:`, error.message, { row });
      // Return minimal valid job data if parsing fails
      return {
        title: title || `Job ${rowIndex + 1}`,
        company: company || 'Company Name',
        location: location || 'Location',
        description: description || 'Job description not available',
        requirements: [],
        employment_type: 'full-time',
        experience_level: 'mid',
        salary_currency: 'USD',
        tech_stack: [],
        visa_sponsorship: false,
        remote: false,
        status: 'active',
        application_type: 'internal',
        sponsored: true
      } as ParsedJobData;
    }
  });
};
