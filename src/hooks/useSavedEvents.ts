import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import { Event, SavedEvent } from '../types/events';
import authService from '../auth/authService';

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

  useEffect(() => {
    const fetchSavedEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const user = authService.getCurrentUser();
        
        if (!user) {
          setSavedEvents([]);
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        // Query saved events for the current user
        const savedEventsQuery = query(
          collection(firestore, 'savedEvents'),
          where('userId', '==', user.uid)
        );
        
        const savedEventsSnapshot = await getDocs(savedEventsQuery);
        const savedEventsData: SavedEvent[] = [];
        
        savedEventsSnapshot.forEach((doc) => {
          savedEventsData.push({ id: doc.id, ...doc.data() } as SavedEvent);
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
        
        setSavedEvents(savedEventsWithDetails);
      } catch (err) {
        console.error('Error fetching saved events:', err);
        setError('Failed to load saved events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedEvents();
  }, [refreshTrigger]);

  // Function to trigger a refresh of saved events
  const refresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return { savedEvents, loading, error, refresh };
};

export default useSavedEvents;
