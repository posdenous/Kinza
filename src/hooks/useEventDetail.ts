import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import { Event } from '../types/events';

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

  useEffect(() => {
    const fetchEventDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch event details
        const eventRef = doc(firestore, 'events', eventId);
        const eventSnapshot = await getDoc(eventRef);

        if (eventSnapshot.exists()) {
          const eventData = { id: eventSnapshot.id, ...eventSnapshot.data() } as Event;
          setEvent(eventData);

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
          
          setComments(commentsData);
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetail();
    }
  }, [eventId]);

  return { event, comments, loading, error };
};

export default useEventDetail;
