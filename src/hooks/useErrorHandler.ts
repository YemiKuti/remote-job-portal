
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseErrorHandlerReturn {
  error: string | null;
  setError: (error: string | null) => void;
  handleError: (error: any, userMessage?: string) => void;
  clearError: () => void;
  isError: boolean;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: any, userMessage?: string) => {
    console.error('Error caught by error handler:', error);
    
    let errorMessage = userMessage || 'An unexpected error occurred. Please try again.';
    
    // Handle specific error types
    if (error?.message) {
      // Don't expose technical error messages to users
      if (error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('unauthorized') || error.message.includes('403')) {
        errorMessage = 'You don\'t have permission to perform this action.';
      } else if (error.message.includes('404')) {
        errorMessage = 'The requested resource was not found.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
      }
    }
    
    setError(errorMessage);
    toast.error(errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    setError,
    handleError,
    clearError,
    isError: !!error
  };
};
