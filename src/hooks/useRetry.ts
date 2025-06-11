
import { useState, useCallback, useRef } from 'react';

interface UseRetryOptions {
  maxAttempts?: number;
  delay?: number;
  onError?: (error: any, attempt: number) => void;
}

interface UseRetryReturn<T> {
  execute: (...args: any[]) => Promise<T>;
  isLoading: boolean;
  error: any;
  attempt: number;
  reset: () => void;
}

export const useRetry = <T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseRetryOptions = {}
): UseRetryReturn<T> => {
  const { maxAttempts = 3, delay = 1000, onError } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [attempt, setAttempt] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (...args: any[]): Promise<T> => {
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);
    
    for (let i = 0; i < maxAttempts; i++) {
      setAttempt(i + 1);
      
      try {
        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Request aborted');
        }
        
        const result = await asyncFunction(...args);
        setIsLoading(false);
        setAttempt(0);
        abortControllerRef.current = null;
        return result;
      } catch (err: any) {
        // Don't retry if request was aborted
        if (err.message === 'Request aborted') {
          setIsLoading(false);
          throw err;
        }
        
        console.error(`Attempt ${i + 1} failed:`, err);
        onError?.(err, i + 1);
        
        if (i === maxAttempts - 1) {
          setError(err);
          setIsLoading(false);
          abortControllerRef.current = null;
          throw err;
        }
        
        // Wait before retrying with exponential backoff
        if (i < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
    
    throw error;
  }, [asyncFunction, maxAttempts, delay, onError, error]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setError(null);
    setAttempt(0);
  }, []);

  return { execute, isLoading, error, attempt, reset };
};
