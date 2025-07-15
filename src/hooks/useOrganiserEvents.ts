import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import { Event } from '../types/events';
import authService from '../auth/authService';

interface EventWithStatus extends Event {
  statusLabel: string;
  statusColor: string;
}

interface UseOrganiserEventsResult {
  events: EventWithStatus[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    views: number;
    saves: number;
  };
}

/**
 * Custom hook to fetch events created by the current organiser
 */
const useOrganiserEvents = (): UseOrganiserEventsResult => {
  const [events, setEvents] = useState<EventWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    views: 0,
    saves: 0,
  });

  useEffect(() => {
    const fetchOrganiserEvents = async () => {
      const user = authService.getCurrentUser();
      
      if (!user) {
        setEvents([]);
        setLoading(false);
        setError('User not authenticated');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Query events created by the current user
        const eventsQuery = query(
          collection(firestore, 'events'),
          where('organiser.id', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsData: EventWithStatus[] = [];
        
        let totalViews = 0;
        let totalSaves = 0;
        let pendingCount = 0;
        let approvedCount = 0;
        let rejectedCount = 0;
        
        eventsSnapshot.forEach((doc) => {
          const eventData = doc.data() as Event;
          const statusInfo = getStatusInfo(eventData.status || 'pending');
          
          // Add status label and color
          const eventWithStatus: EventWithStatus = {
            ...eventData,
            id: doc.id,
            statusLabel: statusInfo.label,
            statusColor: statusInfo.color,
          };
          
          eventsData.push(eventWithStatus);
          
          // Update stats
          totalViews += eventData.views || 0;
          totalSaves += eventData.saves || 0;
          
          if (eventData.status === 'pending') pendingCount++;
          else if (eventData.status === 'approved') approvedCount++;
          else if (eventData.status === 'rejected') rejectedCount++;
        });
        
        // Update stats
        setStats({
          total: eventsSnapshot.size,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          views: totalViews,
          saves: totalSaves,
        });
        
        setEvents(eventsData);
      } catch (err) {
        console.error('Error fetching organiser events:', err);
        setError('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganiserEvents();
  }, [refreshTrigger]);

  // Get status label and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending', color: '#FF9800' };
      case 'approved':
        return { label: 'Approved', color: '#4CAF50' };
      case 'rejected':
        return { label: 'Rejected', color: '#F44336' };
      default:
        return { label: 'Unknown', color: '#9E9E9E' };
    }
  };

  // Function to trigger a refresh
  const refresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return {
    events,
    loading,
    error,
    refresh,
    stats,
  };
};

export default useOrganiserEvents;
