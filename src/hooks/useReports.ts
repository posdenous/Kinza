import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, orderBy, limit, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import authService from '../auth/authService';
import { useUserRole } from '../hooks/useUserRole';
import { useApiWithRetry } from './common/useApiWithRetry';

// Types for reports
export interface Report {
  id: string;
  type: 'event' | 'comment' | 'profile';
  targetId: string;
  reason: string;
  details: string;
  reportedBy: string;
  reportedAt: Date;
  status: 'pending' | 'resolved' | 'dismissed';
  cityId: string;
  contentSnapshot?: any;
}

interface UseReportsResult {
  reports: Report[];
  loading: boolean;
  error: string | null;
  resolveReport: (report: Report) => Promise<boolean>;
  dismissReport: (report: Report) => Promise<boolean>;
  refresh: () => void;
}

/**
 * Custom hook for handling content reports
 */
const useReports = (): UseReportsResult => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { role, userCityId } = useUserRole();
  const user = authService.getCurrentUser();

  // Check if user has admin permissions
  const isAdmin = role === 'admin';

  // Create API call function for retry logic
  const fetchReportsApiCall = useCallback(async () => {
    if (!isAdmin || !user) {
      throw new Error('User not authorized to view reports');
    }

    // Fetch pending reports for the admin's city
    const pendingReportsQuery = query(
      collection(firestore, 'reports'),
      where('status', '==', 'pending'),
      where('cityId', '==', userCityId),
      orderBy('reportedAt', 'desc'),
      limit(50)
    );
    
    const reportsSnapshot = await getDocs(pendingReportsQuery);
    const reportsData: Report[] = [];
    
    reportsSnapshot.forEach((doc) => {
      const reportData = doc.data();
      reportsData.push({
        id: doc.id,
        type: reportData.type,
        targetId: reportData.targetId,
        reason: reportData.reason,
        details: reportData.details,
        reportedBy: reportData.reportedBy,
        reportedAt: new Date(reportData.reportedAt?.toDate() || Date.now()),
        status: reportData.status,
        cityId: reportData.cityId,
        contentSnapshot: reportData.contentSnapshot,
      });
    });
    
    // Fetch content details for each report if not already included in snapshot
    for (let i = 0; i < reportsData.length; i++) {
      const report = reportsData[i];
      
      if (!report.contentSnapshot) {
        try {
          const contentRef = doc(firestore, report.type + 's', report.targetId);
          const contentSnapshot = await getDoc(contentRef);
          
          if (contentSnapshot.exists()) {
            reportsData[i] = {
              ...report,
              contentSnapshot: contentSnapshot.data(),
            };
          }
        } catch (err) {
          console.error(`Error fetching content for report ${report.id}:`, err);
        }
      }
    }
    
    return reportsData;
  }, [isAdmin, user, userCityId, refreshTrigger]);

  // Use retry-enabled API call for fetching reports
  const { execute: fetchReportsWithRetry, isRetrying } = useApiWithRetry(
    fetchReportsApiCall,
    {
      maxRetries: 3,
      baseDelay: 1000,
    }
  );

  useEffect(() => {
    const fetchReports = async () => {
      if (!isAdmin || !user) {
        setReports([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetchReportsWithRetry();
        setReports(result);
      } catch (err) {
        console.error('Error fetching reports:', err);
        if (err instanceof Error && err.message === 'User not authorized to view reports') {
          setReports([]);
          setError('User not authorized to view reports');
        } else {
          setError('Failed to load reports. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [fetchReportsWithRetry, isAdmin, user]);

  // Resolve a report
  const resolveReport = async (report: Report): Promise<boolean> => {
    if (!isAdmin || !user) return false;

    try {
      const reportRef = doc(firestore, 'reports', report.id);
      
      await updateDoc(reportRef, {
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy: user.uid,
      });
      
      // Update local state
      setReports((prev) =>
        prev.filter((prevReport) => prevReport.id !== report.id)
      );
      
      return true;
    } catch (err) {
      console.error('Error resolving report:', err);
      return false;
    }
  };

  // Dismiss a report
  const dismissReport = async (report: Report): Promise<boolean> => {
    if (!isAdmin || !user) return false;

    try {
      const reportRef = doc(firestore, 'reports', report.id);
      
      await updateDoc(reportRef, {
        status: 'dismissed',
        resolvedAt: new Date(),
        resolvedBy: user.uid,
      });
      
      // Update local state
      setReports((prev) =>
        prev.filter((prevReport) => prevReport.id !== report.id)
      );
      
      return true;
    } catch (err) {
      console.error('Error dismissing report:', err);
      return false;
    }
  };

  // Function to trigger a refresh
  const refresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return {
    reports,
    loading: loading || isRetrying,
    error,
    resolveReport,
    dismissReport,
    refresh,
  };
};

export default useReports;
