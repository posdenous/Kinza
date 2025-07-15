import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, orderBy, limit } from 'firebase/firestore';
import { firestore } from '../../firebase/firebaseConfig';
import { Event } from '../types/events';
import authService from '../auth/authService';
import { useUserRole } from '../hooks/useUserRole';

// Types for moderation
export interface ModerationItem {
  id: string;
  type: 'event' | 'comment' | 'profile';
  content: any;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  createdBy: string;
  cityId: string;
}

interface UseModerationResult {
  pendingItems: ModerationItem[];
  loading: boolean;
  error: string | null;
  approveItem: (item: ModerationItem) => Promise<boolean>;
  rejectItem: (item: ModerationItem) => Promise<boolean>;
  refresh: () => void;
}

/**
 * Custom hook for moderation functionality
 * Enforces UGC moderation rule: all user-generated content must pass moderation before display
 */
const useModeration = (): UseModerationResult => {
  const [pendingItems, setPendingItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { role, userCityId } = useUserRole();
  const user = authService.getCurrentUser();

  // Check if user has admin permissions
  const isAdmin = role === 'admin';

  useEffect(() => {
    const fetchPendingItems = async () => {
      if (!isAdmin || !user) {
        setPendingItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch pending events for the admin's city
        const pendingEventsQuery = query(
          collection(firestore, 'events'),
          where('status', '==', 'pending'),
          where('cityId', '==', userCityId),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        
        const pendingEventsSnapshot = await getDocs(pendingEventsQuery);
        const pendingEventsData: ModerationItem[] = [];
        
        pendingEventsSnapshot.forEach((doc) => {
          const eventData = doc.data() as Event;
          pendingEventsData.push({
            id: doc.id,
            type: 'event',
            content: eventData,
            status: 'pending',
            createdAt: new Date(eventData.createdAt?.toDate() || Date.now()),
            createdBy: eventData.organiser?.id || 'unknown',
            cityId: eventData.cityId,
          });
        });

        // Fetch pending comments
        const pendingCommentsQuery = query(
          collection(firestore, 'comments'),
          where('status', '==', 'pending'),
          where('cityId', '==', userCityId),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        
        const pendingCommentsSnapshot = await getDocs(pendingCommentsQuery);
        const pendingCommentsData: ModerationItem[] = [];
        
        pendingCommentsSnapshot.forEach((doc) => {
          const commentData = doc.data();
          pendingCommentsData.push({
            id: doc.id,
            type: 'comment',
            content: commentData,
            status: 'pending',
            createdAt: new Date(commentData.createdAt?.toDate() || Date.now()),
            createdBy: commentData.userId || 'unknown',
            cityId: commentData.cityId,
          });
        });

        // Combine and sort by creation date (newest first)
        const allPendingItems = [...pendingEventsData, ...pendingCommentsData].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
        
        setPendingItems(allPendingItems);
      } catch (err) {
        console.error('Error fetching moderation items:', err);
        setError('Failed to load moderation queue. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingItems();
  }, [isAdmin, user, userCityId, refreshTrigger]);

  // Approve a moderation item
  const approveItem = async (item: ModerationItem): Promise<boolean> => {
    if (!isAdmin || !user) return false;

    try {
      const itemRef = doc(firestore, item.type === 'event' ? 'events' : 'comments', item.id);
      
      await updateDoc(itemRef, {
        status: 'approved',
        approved: true,
        moderatedAt: new Date(),
        moderatedBy: user.uid,
      });
      
      // Update local state
      setPendingItems((prev) =>
        prev.filter((prevItem) => prevItem.id !== item.id)
      );
      
      return true;
    } catch (err) {
      console.error('Error approving item:', err);
      return false;
    }
  };

  // Reject a moderation item
  const rejectItem = async (item: ModerationItem): Promise<boolean> => {
    if (!isAdmin || !user) return false;

    try {
      const itemRef = doc(firestore, item.type === 'event' ? 'events' : 'comments', item.id);
      
      await updateDoc(itemRef, {
        status: 'rejected',
        approved: false,
        moderatedAt: new Date(),
        moderatedBy: user.uid,
      });
      
      // Update local state
      setPendingItems((prev) =>
        prev.filter((prevItem) => prevItem.id !== item.id)
      );
      
      return true;
    } catch (err) {
      console.error('Error rejecting item:', err);
      return false;
    }
  };

  // Function to trigger a refresh
  const refresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return {
    pendingItems,
    loading,
    error,
    approveItem,
    rejectItem,
    refresh,
  };
};

export default useModeration;
