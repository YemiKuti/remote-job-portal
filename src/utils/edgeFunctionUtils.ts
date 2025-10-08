import { CV_TAILORING_ENDPOINT, API_TIMEOUT } from "@/config/api";

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

export interface EdgeFunctionError {
  message: string;
  isRetryable: boolean;
  userMessage: string;
}

/**
 * Classifies edge function errors and determines if they're retryable
 */
export function classifyEdgeFunctionError(error: any): EdgeFunctionError {
  const errorMessage = error?.message || String(error);
  
  // Connection/Network errors are retryable
  if (errorMessage.includes('Failed to fetch') || 
      errorMessage.includes('NetworkError') ||
      errorMessage.includes('network') || 
      errorMessage.includes('Connection')) {
    return {
      message: errorMessage,
      isRetryable: true,
      userMessage: '⚠️ Unable to connect to the server. Please try again later.'
    };
  }
  
  // Timeout errors are retryable
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out') ||
      errorMessage.includes('AbortError')) {
    return {
      message: errorMessage,
      isRetryable: true,
      userMessage: '⚠️ Request timed out. Please try again.'
    };
  }
  
  // File too large errors are not retryable
  if (errorMessage.includes('FILE_TOO_LARGE') || errorMessage.includes('too large')) {
    return {
      message: errorMessage,
      isRetryable: false,
      userMessage: 'Your file is too large. Please upload a resume under 10MB.'
    };
  }
  
  // Server errors (5xx) are retryable
  if (errorMessage.includes('500') || errorMessage.includes('502') || 
      errorMessage.includes('503') || errorMessage.includes('504') ||
      errorMessage.includes('Internal Server Error') ||
      errorMessage.includes('worker boot error')) {
    return {
      message: errorMessage,
      isRetryable: true,
      userMessage: 'Server temporarily unavailable. Retrying...'
    };
  }
  
  // File format errors are not retryable
  if (errorMessage.includes('Unsupported file format') || 
      errorMessage.includes('Could not extract text') ||
      errorMessage.includes('invalid')) {
    return {
      message: errorMessage,
      isRetryable: false,
      userMessage: errorMessage
    };
  }
  
  // Generic errors - show connection error message
  return {
    message: errorMessage,
    isRetryable: true,
    userMessage: '⚠️ Unable to connect to the server. Please try again later.'
  };
}

/**
 * Calls the CV tailoring API with exponential backoff retry logic
 * Now using a configurable endpoint instead of Supabase Edge Functions
 */
export async function callEdgeFunctionWithRetry(
  functionName: string,
  payload: any,
  options: RetryOptions = {},
  onProgress?: (message: string, retryCount?: number) => void
): Promise<any> {
  const {
    maxRetries = 2,
    baseDelay = 1000,
    maxDelay = 10000
  } = options;
  
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt + 1}/${maxRetries + 1} for ${functionName} to ${CV_TAILORING_ENDPOINT}`);
      
      if (attempt > 0) {
        onProgress?.(`Retrying... (attempt ${attempt + 1})`, attempt);
      }
      
      // Create FormData or use JSON payload
      let body: FormData | string;
      let headers: Record<string, string> = {};
      
      if (payload instanceof FormData) {
        // Use FormData as-is for file uploads
        body = payload;
        console.log('📤 Sending FormData with file');
      } else {
        // Convert to JSON for regular payloads
        body = JSON.stringify(payload);
        headers['Content-Type'] = 'application/json';
        console.log('📤 Sending JSON payload');
      }
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
      
      try {
        const response = await fetch(CV_TAILORING_ENDPOINT, {
          method: 'POST',
          body,
          headers,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('✅ Response received:', { 
          status: response.status,
          hasData: !!data 
        });
        
        // For httpbin.org/post testing endpoint, it returns the sent data wrapped
        // In production, your API should return the actual response
        if (CV_TAILORING_ENDPOINT.includes('httpbin.org')) {
          console.log('ℹ️ Using test endpoint (httpbin.org)');
          onProgress?.('✅ Request sent successfully. Resume received for processing.', undefined);
          return {
            success: true,
            message: '✅ Request sent successfully. Resume received for processing.',
            tailoredResume: 'Mock tailored resume content would go here in production',
            score: 85,
            analysis: {
              skillsMatched: 8,
              requiredSkills: 10,
              candidateSkills: ['React', 'TypeScript', 'Node.js'],
              experienceLevel: 'Mid-level',
              hasCareerProfile: true,
              hasContactInfo: true
            },
            suggestions: {
              keywordsMatched: 12,
              totalKeywords: 15,
              recommendations: [
                'Add more quantifiable achievements',
                'Emphasize leadership experience',
                'Include relevant certifications'
              ]
            }
          };
        }
        
        // Check if the response indicates an error
        if (data && data.success === false) {
          throw new Error(data.error || 'API returned error');
        }
        
        return data;
        
      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
          throw new Error('⚠️ Request timed out. Please try again.');
        }
        throw fetchError;
      }
      
    } catch (error) {
      lastError = error;
      console.error(`❌ Attempt ${attempt + 1} failed:`, error);
      
      const errorInfo = classifyEdgeFunctionError(error);
      
      // If error is not retryable or we've exhausted retries, throw immediately
      if (!errorInfo.isRetryable || attempt === maxRetries) {
        throw new Error(errorInfo.userMessage);
      }
      
      // Calculate exponential backoff delay
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      onProgress?.(errorInfo.userMessage, attempt);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never be reached, but just in case
  throw new Error('⚠️ Unable to connect to the server. Please try again later.');
}

/**
 * Validates file size before uploading
 */
export function validateFileSize(file: File, maxSizeMB: number = 10): void {
  // Check if file is empty or corrupted (0 bytes)
  if (file.size === 0) {
    throw new Error('Your resume file seems to be empty or invalid. Please upload a valid PDF, DOC, DOCX, or TXT file (max 10MB).');
  }
  
  const maxBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxBytes) {
    throw new Error(`Your file is too large. Please upload a resume under ${maxSizeMB}MB.`);
  }
  
  if (file.size < 100) {
    throw new Error('Your resume file seems to be empty or invalid. Please upload a valid PDF, DOC, DOCX, or TXT file (max 10MB).');
  }
}

/**
 * Validates file format
 */
export function validateFileFormat(fileName: string): void {
  const supportedFormats = ['.pdf', '.docx', '.doc', '.txt'];
  const lowerFileName = fileName.toLowerCase();
  
  const isSupported = supportedFormats.some(format => lowerFileName.endsWith(format));
  
  if (!isSupported) {
    throw new Error('Your resume file seems to be empty or invalid. Please upload a valid PDF, DOC, DOCX, or TXT file (max 10MB).');
  }
}