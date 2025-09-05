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

// Enhanced file parser that handles both CSV and XLSX
export const parseFile = async (file: File): Promise<FileParseResult> => {
  try {
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      };
    }
    
    const fileType = detectFileType(file);
    
    if (fileType === 'unsupported') {
      return {
        success: false,
        error: 'Unsupported file format. Please upload a .csv or .xlsx file.'
      };
    }
    
    let data: ParsedFileData;
    
    if (fileType === 'csv') {
      data = await parseCSVFile(file);
    } else {
      data = await parseXLSXFile(file);
    }
    
    // Validate we have some headers
    if (data.headers.length === 0) {
      return {
        success: false,
        error: 'No valid headers found in file. Please check the file format.'
      };
    }
    
    // Limit to 1000 rows for performance
    if (data.totalRows > 1000) {
      return {
        success: false,
        error: 'File contains too many rows (maximum 1000). Please split your file.'
      };
    }
    
    return {
      success: true,
      data
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to parse file'
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
  return rows.map(row => {
    const mappedRow: any = {};
    
    // Apply header mapping
    Object.entries(row).forEach(([originalHeader, value]) => {
      const mappedHeader = headerMapping[originalHeader];
      if (mappedHeader && value !== null && value !== undefined) {
        mappedRow[mappedHeader] = String(value).trim();
      }
    });
    
    // Parse and validate individual fields
    const getField = (field: string): string => {
      return mappedRow[field] || '';
    };
    
    const parseBoolean = (value: string): boolean => {
      const normalized = value.toLowerCase().trim();
      return ['true', 'yes', '1', 'y'].includes(normalized);
    };
    
    const parseArray = (value: string): string[] => {
      if (!value) return [];
      return value.split(/[,;]/).map(item => item.trim()).filter(item => item.length > 0);
    };
    
    const parseSalary = (value: string): number | undefined => {
      if (!value) return undefined;
      const numericValue = value.replace(/[^0-9]/g, '');
      const parsed = parseInt(numericValue, 10);
      return isNaN(parsed) ? undefined : parsed;
    };
    
    return {
      title: getField('title'),
      company: getField('company'),
      location: getField('location'),
      description: getField('description'),
      requirements: parseArray(getField('requirements')),
      employment_type: getField('employment_type') || 'full-time',
      experience_level: getField('experience_level') || 'mid',
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
  });
};
