import { useState, useCallback, useRef } from 'react';

interface SubmissionRecord {
  timestamp: number;
  type: 'event' | 'comment';
}

interface UseSubmissionThrottleOptions {
  maxSubmissions?: number;
  timeWindowMs?: number;
}

interface UseSubmissionThrottleResult {
  canSubmit: (type: 'event' | 'comment') => boolean;
  recordSubmission: (type: 'event' | 'comment') => void;
  getRemainingSubmissions: (type: 'event' | 'comment') => number;
  getTimeUntilReset: () => number;
  isThrottled: boolean;
}

/**
 * Custom hook for submission throttling
 * Implements submission_throttle rule: prevent users from submitting more than 5 events or comments within a 10-minute window
 */
export const useSubmissionThrottle = (
  options: UseSubmissionThrottleOptions = {}
): UseSubmissionThrottleResult => {
  const {
    maxSubmissions = 5,
    timeWindowMs = 10 * 60 * 1000, // 10 minutes
  } = options;

  const submissionsRef = useRef<SubmissionRecord[]>([]);
  const [isThrottled, setIsThrottled] = useState(false);

  // Clean up old submissions outside the time window
  const cleanupOldSubmissions = useCallback(() => {
    const now = Date.now();
    submissionsRef.current = submissionsRef.current.filter(
      (record) => now - record.timestamp < timeWindowMs
    );
  }, [timeWindowMs]);

  // Check if user can submit based on current throttle state
  const canSubmit = useCallback((type: 'event' | 'comment'): boolean => {
    cleanupOldSubmissions();
    
    const recentSubmissions = submissionsRef.current.filter(
      (record) => record.type === type
    );
    
    const canSubmitNow = recentSubmissions.length < maxSubmissions;
    setIsThrottled(!canSubmitNow);
    
    return canSubmitNow;
  }, [maxSubmissions, cleanupOldSubmissions]);

  // Record a new submission
  const recordSubmission = useCallback((type: 'event' | 'comment') => {
    const now = Date.now();
    submissionsRef.current.push({
      timestamp: now,
      type,
    });
    
    // Clean up after recording
    cleanupOldSubmissions();
  }, [cleanupOldSubmissions]);

  // Get remaining submissions for a specific type
  const getRemainingSubmissions = useCallback((type: 'event' | 'comment'): number => {
    cleanupOldSubmissions();
    
    const recentSubmissions = submissionsRef.current.filter(
      (record) => record.type === type
    );
    
    return Math.max(0, maxSubmissions - recentSubmissions.length);
  }, [maxSubmissions, cleanupOldSubmissions]);

  // Get time until throttle resets (in milliseconds)
  const getTimeUntilReset = useCallback((): number => {
    cleanupOldSubmissions();
    
    if (submissionsRef.current.length === 0) {
      return 0;
    }
    
    const oldestSubmission = Math.min(
      ...submissionsRef.current.map((record) => record.timestamp)
    );
    
    const resetTime = oldestSubmission + timeWindowMs;
    const now = Date.now();
    
    return Math.max(0, resetTime - now);
  }, [timeWindowMs, cleanupOldSubmissions]);

  return {
    canSubmit,
    recordSubmission,
    getRemainingSubmissions,
    getTimeUntilReset,
    isThrottled,
  };
};
