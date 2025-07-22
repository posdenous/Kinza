import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import { Event, SavedEvent } from '../types/events';
import authService from '../auth/authService';
import useApiWithRetry from './common/useApiWithRetry';

interface SavedEventWithDetails extends SavedEvent {
  eventDetails: Event | null;
}

interface UseSavedEventsResult {
  savedEvents: SavedEventWithDetails[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * Custom hook to fetch user's saved events with event details
 */
const useSavedEvents = (): UseSavedEventsResult => {
  const [savedEvents, setSavedEvents] = useState<SavedEventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Create retry-enabled API call
  const { execute: fetchSavedEventsWithRetry, isRetrying } = useApiWithRetry(
    async () => {
      const user = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Query saved events for the current user
      const savedEventsQuery = query(
        collection(firestore, 'savedEvents'),
        where('userId', '==', user.uid)
      );
      
      const savedEventsSnapshot = await getDocs(savedEventsQuery);
      const savedEventsData: SavedEvent[] = [];
      
      savedEventsSnapshot.forEach((doc) => {
        const data = doc.data();
        savedEventsData.push({ 
          id: doc.id, 
          userId: data.userId,
          eventId: data.eventId,
          savedAt: data.savedAt,
          ...data 
        } as SavedEvent);
      });

      // Fetch event details for each saved event
      const savedEventsWithDetails: SavedEventWithDetails[] = [];
      
      for (const savedEvent of savedEventsData) {
        const eventRef = doc(firestore, 'events', savedEvent.eventId);
        const eventSnapshot = await getDoc(eventRef);
        
        if (eventSnapshot.exists()) {
          savedEventsWithDetails.push({
            ...savedEvent,
            eventDetails: { id: eventSnapshot.id, ...eventSnapshot.data() } as Event,
          });
        } else {
          savedEventsWithDetails.push({
            ...savedEvent,
            eventDetails: null,
          });
        }
      }
      
      // Sort by saved date (newest first)
      savedEventsWithDetails.sort((a, b) => {
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
      });
      
      return savedEventsWithDetails;
    },
    { maxRetries: 3, baseDelay: 1000 }
  );

  useEffect(() => {
    const fetchSavedEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchSavedEventsWithRetry();
        setSavedEvents(result);
      } catch (err) {
        console.error('Error fetching saved events:', err);
        if (err instanceof Error && err.message === 'User not authenticated') {
          setSavedEvents([]);
          setError('User not authenticated');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load saved events. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSavedEvents();
  }, [refreshTrigger, fetchSavedEventsWithRetry]);

  // Function to trigger a refresh of saved events
  const refresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return { savedEvents, loading, error, refresh };
};

export default useSavedEvents;
