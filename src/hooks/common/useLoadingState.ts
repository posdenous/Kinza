import { useState, useCallback, useEffect, useRef } from 'react';

interface LoadingOptions {
  initialLoading?: boolean;
  timeout?: number;
  onTimeout?: () => void;
}

/**
 * Custom hook for managing loading states with timeout handling
 * @param options - Configuration options
 * @returns Loading state and helper functions
 */
function useLoadingState(options: LoadingOptions = {}) {
  const {
    initialLoading = false,
    timeout = 0, // 0 means no timeout
    onTimeout,
  } = options;

  const [isLoading, setIsLoading] = useState<boolean>(initialLoading);
  const [hasTimedOut, setHasTimedOut] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any existing timeout
  const clearTimeoutRef = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Set up timeout when loading starts
  useEffect(() => {
    if (isLoading && timeout > 0 && !timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        setHasTimedOut(true);
        setIsLoading(false);
        if (onTimeout) {
          onTimeout();
        }
      }, timeout);
    }

    // Clean up timeout when loading stops
    if (!isLoading && timeoutRef.current) {
      clearTimeoutRef();
    }

    // Clean up on unmount
    return clearTimeoutRef;
  }, [isLoading, timeout, onTimeout, clearTimeoutRef]);

  // Start loading with timeout reset
  const startLoading = useCallback(() => {
    clearTimeoutRef();
    setHasTimedOut(false);
    setIsLoading(true);
  }, [clearTimeoutRef]);

  // Stop loading and clear timeout
  const stopLoading = useCallback(() => {
    clearTimeoutRef();
    setIsLoading(false);
  }, [clearTimeoutRef]);

  // Reset timeout state
  const resetTimeout = useCallback(() => {
    setHasTimedOut(false);
  }, []);

  return {
    isLoading,
    setLoading: setIsLoading,
    hasTimedOut,
    resetTimeout,
    startLoading,
    stopLoading,
  };
}

export default useLoadingState;
