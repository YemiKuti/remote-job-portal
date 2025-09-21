import { supabase } from "@/integrations/supabase/client";

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
  
  // File too large errors are not retryable
  if (errorMessage.includes('FILE_TOO_LARGE') || errorMessage.includes('too large')) {
    return {
      message: errorMessage,
      isRetryable: false,
      userMessage: 'Your file is too large. Please upload a resume under 10MB.'
    };
  }
  
  // Network/timeout errors are retryable
  if (errorMessage.includes('timeout') || errorMessage.includes('network') || 
      errorMessage.includes('Failed to send') || errorMessage.includes('Connection')) {
    return {
      message: errorMessage,
      isRetryable: true,
      userMessage: 'Network issue detected. Retrying...'
    };
  }
  
  // Server errors are retryable
  if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error') ||
      errorMessage.includes('worker boot error')) {
    return {
      message: errorMessage,
      isRetryable: true,
      userMessage: 'Server temporarily unavailable. Retrying...'
    };
  }
  
  // File format errors are not retryable
  if (errorMessage.includes('Unsupported file format') || 
      errorMessage.includes('Could not extract text')) {
    return {
      message: errorMessage,
      isRetryable: false,
      userMessage: errorMessage
    };
  }
  
  // Generic errors are retryable once
  return {
    message: errorMessage,
    isRetryable: true,
    userMessage: 'Processing failed. Retrying...'
  };
}

/**
 * Calls an edge function with exponential backoff retry logic
 */
export async function callEdgeFunctionWithRetry(
  functionName: string,
  payload: any,
  options: RetryOptions = {},
  onProgress?: (message: string, retryCount?: number) => void
): Promise<any> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000
  } = options;
  
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt + 1}/${maxRetries + 1} for ${functionName}`);
      
      if (attempt > 0) {
        onProgress?.(`Retrying... (attempt ${attempt + 1})`, attempt);
      }
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      });
      
      if (error) {
        throw error;
      }
      
      // Check if the response indicates an error
      if (data && data.success === false) {
        throw new Error(data.error || 'Function returned error');
      }
      
      return data;
      
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
  throw lastError;
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