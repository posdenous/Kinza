import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useNetworkStatus from './useNetworkStatus';

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: any) => boolean;
}

interface ApiRetryResult<T> {
  execute: () => Promise<T>;
  isRetrying: boolean;
  retryCount: number;
  reset: () => void;
}

/**
 * Custom hook for API calls with automatic retry logic and exponential backoff
 * @param apiCall - The API function to execute
 * @param options - Retry configuration options
 * @returns Object with execute function and retry state
 */
export const useApiWithRetry = <T>(
  apiCall: () => Promise<T>,
  options: RetryOptions = {}
): ApiRetryResult<T> => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    retryCondition = (error) => {
      // Retry on network errors, timeouts, and 5xx server errors
      return (
        error.code === 'network-request-failed' ||
        error.code === 'timeout' ||
        error.message?.includes('timeout') ||
        error.message?.includes('network') ||
        (error.status >= 500 && error.status < 600)
      );
    },
  } = options;

  const { t } = useTranslation();
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const calculateDelay = (attempt: number): number => {
    const delay = baseDelay * Math.pow(backoffMultiplier, attempt);
    return Math.min(delay, maxDelay);
  };

  const execute = useCallback(async (): Promise<T> => {
    // Check network connectivity first
    if (!isConnected || !isInternetReachable) {
      throw new Error(t('errors.offline'));
    }

    let lastError: any;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        setIsRetrying(attempt > 0);
        setRetryCount(attempt);

        const result = await apiCall();
        
        // Success - reset retry state
        setIsRetrying(false);
        setRetryCount(0);
        
        return result;
      } catch (error) {
        lastError = error;
        
        // Don't retry if we've reached max attempts
        if (attempt >= maxRetries) {
          break;
        }

        // Don't retry if the error doesn't meet retry conditions
        if (!retryCondition(error)) {
          break;
        }

        // Don't retry if we've lost network connection
        if (!isConnected || !isInternetReachable) {
          throw new Error(t('errors.offline'));
        }

        // Calculate delay and wait before retry
        const delay = calculateDelay(attempt);
        await sleep(delay);
        
        attempt++;
      }
    }

    // All retries failed
    setIsRetrying(false);
    
    // Enhance error message with retry information
    if (retryCount > 0) {
      lastError.message = `${lastError.message} (${t('errors.retriedTimes', { count: retryCount })})`;
    }
    
    throw lastError;
  }, [apiCall, maxRetries, retryCondition, isConnected, isInternetReachable, t, retryCount]);

  const reset = useCallback(() => {
    setIsRetrying(false);
    setRetryCount(0);
  }, []);

  return {
    execute,
    isRetrying,
    retryCount,
    reset,
  };
};

export default useApiWithRetry;
