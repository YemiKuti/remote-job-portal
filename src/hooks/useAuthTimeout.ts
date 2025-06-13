
import { useEffect, useRef } from 'react';

interface UseAuthTimeoutOptions {
  timeout?: number;
  onTimeout?: () => void;
  onComplete?: () => void;
}

export const useAuthTimeout = ({
  timeout = 5000,
  onTimeout,
  onComplete
}: UseAuthTimeoutOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const startTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current && onTimeout) {
        onTimeout();
      }
    }, timeout);
  };

  const clearAuthTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (mountedRef.current && onComplete) {
      onComplete();
    }
  };

  const resetTimeout = () => {
    clearAuthTimeout();
    startTimeout();
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    startTimeout,
    clearAuthTimeout,
    resetTimeout
  };
};
