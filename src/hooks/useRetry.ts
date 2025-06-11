
import { useState, useCallback } from 'react';

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

  const execute = useCallback(async (...args: any[]): Promise<T> => {
    setIsLoading(true);
    setError(null);
    
    for (let i = 0; i < maxAttempts; i++) {
      setAttempt(i + 1);
      
      try {
        const result = await asyncFunction(...args);
        setIsLoading(false);
        setAttempt(0);
        return result;
      } catch (err) {
        console.error(`Attempt ${i + 1} failed:`, err);
        onError?.(err, i + 1);
        
        if (i === maxAttempts - 1) {
          setError(err);
          setIsLoading(false);
          throw err;
        }
        
        // Wait before retrying
        if (i < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }
    
    throw error;
  }, [asyncFunction, maxAttempts, delay, onError, error]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setAttempt(0);
  }, []);

  return { execute, isLoading, error, attempt, reset };
};
