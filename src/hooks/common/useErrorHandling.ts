import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

interface ErrorHandlingOptions {
  showAlerts?: boolean;
  defaultErrorTitle?: string;
  defaultErrorMessage?: string;
  logErrors?: boolean;
}

/**
 * Custom hook for standardized error handling across the app
 * @param options - Configuration options
 * @returns Error state and helper functions
 */
function useErrorHandling(options: ErrorHandlingOptions = {}) {
  const {
    showAlerts = true,
    defaultErrorTitle,
    defaultErrorMessage,
    logErrors = true,
  } = options;

  const { t } = useTranslation();
  const [error, setError] = useState<Error | null>(null);

  // Display error alert
  const showErrorAlert = useCallback((err: Error, customTitle?: string, customMessage?: string) => {
    if (!showAlerts) return;
    
    const title = customTitle || defaultErrorTitle || t('common.error');
    const message = customMessage || err.message || defaultErrorMessage || t('common.tryAgainLater');
    
    Alert.alert(
      title,
      message,
      [{ text: t('common.ok') }]
    );
  }, [showAlerts, defaultErrorTitle, defaultErrorMessage, t]);

  // Handle error from async function
  const handleError = useCallback(async <T>(fn: () => Promise<T>, customTitle?: string, customMessage?: string): Promise<T | null> => {
    try {
      const result = await fn();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      if (logErrors) {
        console.error('Error caught by useErrorHandling:', error);
      }
      
      setError(error);
      showErrorAlert(error, customTitle, customMessage);
      return null;
    }
  }, [logErrors, showErrorAlert]);

  // Clear current error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Set error with optional alert
  const setErrorWithAlert = useCallback((err: Error, customTitle?: string, customMessage?: string) => {
    setError(err);
    showErrorAlert(err, customTitle, customMessage);
  }, [showErrorAlert]);

  return {
    error,
    setError,
    handleError,
    clearError,
    setErrorWithAlert,
  };
}

export default useErrorHandling;
