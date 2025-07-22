import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import { Event } from '../types/events';
import { useApiWithRetry } from './common/useApiWithRetry';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
  isApproved: boolean;
}

interface UseEventDetailResult {
  event: Event | null;
  comments: Comment[];
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch event details and comments
 */
const useEventDetail = (eventId: string): UseEventDetailResult => {
  const [event, setEvent] = useState<Event | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create API call function for retry logic
  const fetchEventDetailApiCall = useCallback(async () => {
    // Fetch event details
    const eventRef = doc(firestore, 'events', eventId);
    const eventSnapshot = await getDoc(eventRef);

    if (eventSnapshot.exists()) {
      const eventData = { id: eventSnapshot.id, ...eventSnapshot.data() } as Event;

      // Fetch approved comments for the event
      const commentsQuery = query(
        collection(firestore, 'comments'),
        where('eventId', '==', eventId),
        where('isApproved', '==', true)
      );
      
      const commentsSnapshot = await getDocs(commentsQuery);
      const commentsData: Comment[] = [];
      
      commentsSnapshot.forEach((doc) => {
        commentsData.push({ id: doc.id, ...doc.data() } as Comment);
      });
      
      // Sort comments by creation date (newest first)
      commentsData.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      return { event: eventData, comments: commentsData };
    } else {
      throw new Error('Event not found');
    }
  }, [eventId]);

  // Use retry-enabled API call for fetching event details
  const { execute: fetchEventDetailWithRetry, isRetrying } = useApiWithRetry(
    fetchEventDetailApiCall,
    {
      maxRetries: 3,
      baseDelay: 1000,
    }
  );

  useEffect(() => {
    const fetchEventDetail = async () => {
      if (!eventId) return;
      
      setLoading(true);
      setError(null);

      try {
        const result = await fetchEventDetailWithRetry();
        setEvent(result.event);
        setComments(result.comments);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load event details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetail();
  }, [eventId, fetchEventDetailWithRetry]);

  return { event, comments, loading: loading || isRetrying, error };
};

export default useEventDetail;
