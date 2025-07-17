import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  Timestamp,
  DocumentReference
} from 'firebase/firestore';
import { useFirestoreInstance } from './useFirestoreInstance';
import { useUserRole } from './useUserRole';
import { useUserCity } from './useCities';

export type ContentType = 'event' | 'comment' | 'profile' | 'venue';

export interface ModerationItem {
  id: string;
  contentId: string;
  contentType: ContentType;
  contentData: any;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  submittedAt: Timestamp;
  cityId: string;
  moderatedBy?: string;
  moderatedAt?: Timestamp;
  reason?: string;
  aiFlags?: string[];
}

export interface UseUgcModerationResult {
  submitForModeration: (contentType: ContentType, contentId: string, contentData: any) => Promise<boolean>;
  approveContent: (moderationId: string) => Promise<boolean>;
  rejectContent: (moderationId: string, reason: string) => Promise<boolean>;
  checkModerationStatus: (contentType: ContentType, contentId: string) => Promise<string | null>;
  pendingModerationCount: number;
  loading: boolean;
  error: Error | null;
}

/**
 * Custom hook for handling user-generated content moderation
 * Enforces the rule that all user-generated content must pass moderation before being displayed
 */
export interface UseUgcModerationOptions {
  aiScreen?: (contentType: ContentType, contentData: any) => Promise<string[]>;
}
const useUgcModeration = ({ aiScreen }: UseUgcModerationOptions = {}): UseUgcModerationResult => {
  const { t } = useTranslation();
  const [firestore] = useFirestoreInstance();
  const { role: userRole } = useUserRole();
  const { currentCityId } = useUserCity();
  
  const [pendingModerationCount, setPendingModerationCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch pending moderation count
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (!firestore || !currentCityId) return;
      
      try {
        setLoading(true);
        const moderationRef = collection(firestore, 'moderation');
        const q = query(
          moderationRef,
          where('status', '==', 'pending'),
          where('cityId', '==', currentCityId)
        );
        
        const snapshot = await getDocs(q);
        setPendingModerationCount(snapshot.size);
      } catch (err) {
        console.error('Error fetching moderation count:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingCount();
  }, [firestore, currentCityId]);

  /**
   * Submit content for moderation
   * @param contentType Type of content (event, comment, profile, venue)
   * @param contentId ID of the content
   * @param contentData Data of the content
   * @returns Promise<boolean> Success status
   */
  const submitForModeration = async (
    contentType: ContentType, 
    contentId: string, 
    contentData: any
  ): Promise<boolean> => {
    if (!firestore || !currentCityId) {
      setError(new Error(t('moderation.noFirestore')));
      return false;
    }
    
    try {
      setLoading(true);
      
      // Run AI content screening (can be injected for testing)
      const aiFlags = await (aiScreen ?? runAiScreening)(contentType, contentData);
      
      // Create moderation item
      const moderationRef = collection(firestore, 'moderation');
      await addDoc(moderationRef, {
        contentId,
        contentType,
        contentData,
        status: 'pending',
        submittedBy: contentData.userId || 'anonymous',
        submittedAt: serverTimestamp(),
        cityId: currentCityId,
        aiFlags
      });
      
      // Update the original content with moderation status
      const contentRef = doc(firestore, contentType + 's', contentId);
      await updateDoc(contentRef, {
        moderationStatus: 'pending',
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (err) {
      console.error('Error submitting for moderation:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Approve moderated content
   * @param moderationId ID of the moderation item
   * @returns Promise<boolean> Success status
   */
  const approveContent = async (moderationId: string): Promise<boolean> => {
    if (!firestore || !currentCityId || !['admin', 'organiser'].includes(userRole)) {
      setError(new Error(t('moderation.notAuthorized')));
      return false;
    }
    
    try {
      setLoading(true);
      
      // Get moderation item
      const moderationRef = doc(firestore, 'moderation', moderationId);
      const moderationDoc = await getDocs(query(
        collection(firestore, 'moderation'),
        where('__name__', '==', moderationId)
      ));
      
      if (moderationDoc.empty) {
        setError(new Error(t('moderation.itemNotFound')));
        return false;
      }
      
      const moderationData = moderationDoc.docs[0].data() as ModerationItem;
      
      // Check city scope
      if (moderationData.cityId !== currentCityId) {
        setError(new Error(t('moderation.wrongCity')));
        return false;
      }
      
      // Update moderation status
      await updateDoc(moderationRef, {
        status: 'approved',
        moderatedBy: 'current-user-id', // Replace with actual user ID
        moderatedAt: serverTimestamp()
      });
      
      // Update the original content
      const contentRef = doc(firestore, moderationData.contentType + 's', moderationData.contentId);
      await updateDoc(contentRef, {
        moderationStatus: 'approved',
        isVisible: true,
        updatedAt: serverTimestamp()
      });
      
      // Update pending count
      setPendingModerationCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (err) {
      console.error('Error approving content:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reject moderated content
   * @param moderationId ID of the moderation item
   * @param reason Reason for rejection
   * @returns Promise<boolean> Success status
   */
  const rejectContent = async (moderationId: string, reason: string): Promise<boolean> => {
    if (!firestore || !currentCityId || !['admin', 'organiser'].includes(userRole)) {
      setError(new Error(t('moderation.notAuthorized')));
      return false;
    }
    
    if (!reason || reason.trim() === '') {
      setError(new Error(t('moderation.reasonRequired')));
      return false;
    }
    
    try {
      setLoading(true);
      
      // Get moderation item
      const moderationRef = doc(firestore, 'moderation', moderationId);
      const moderationDoc = await getDocs(query(
        collection(firestore, 'moderation'),
        where('__name__', '==', moderationId)
      ));
      
      if (moderationDoc.empty) {
        setError(new Error(t('moderation.itemNotFound')));
        return false;
      }
      
      const moderationData = moderationDoc.docs[0].data() as ModerationItem;
      
      // Check city scope
      if (moderationData.cityId !== currentCityId) {
        setError(new Error(t('moderation.wrongCity')));
        return false;
      }
      
      // Update moderation status
      await updateDoc(moderationRef, {
        status: 'rejected',
        moderatedBy: 'current-user-id', // Replace with actual user ID
        moderatedAt: serverTimestamp(),
        reason
      });
      
      // Update the original content
      const contentRef = doc(firestore, moderationData.contentType + 's', moderationData.contentId);
      await updateDoc(contentRef, {
        moderationStatus: 'rejected',
        isVisible: false,
        rejectionReason: reason,
        updatedAt: serverTimestamp()
      });
      
      // Update pending count
      setPendingModerationCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (err) {
      console.error('Error rejecting content:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check moderation status of content
   * @param contentType Type of content
   * @param contentId ID of the content
   * @returns Promise<string | null> Moderation status or null if not found
   */
  const checkModerationStatus = async (
    contentType: ContentType, 
    contentId: string
  ): Promise<string | null> => {
    if (!firestore || !currentCityId) {
      return null;
    }
    
    try {
      const moderationRef = collection(firestore, 'moderation');
      const q = query(
        moderationRef,
        where('contentType', '==', contentType),
        where('contentId', '==', contentId),
        where('cityId', '==', currentCityId)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      // Get the most recent moderation item
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ModerationItem[];
      
      const sortedItems = items.sort((a, b) => {
        return b.submittedAt.toMillis() - a.submittedAt.toMillis();
      });
      
      return sortedItems[0].status;
    } catch (err) {
      console.error('Error checking moderation status:', err);
      return null;
    }
  };

  /**
   * Run AI screening on content (simulated)
   * @param contentType Type of content
   * @param contentData Content data
   * @returns Promise<string[]> Array of AI flags
   */
  const runAiScreening = async (contentType: ContentType, contentData: any): Promise<string[]> => {
    // This is a placeholder for actual AI screening
    // In a real implementation, this would call an AI moderation service
    const flags: string[] = [];
    
    // Simple keyword-based screening
    const sensitiveKeywords = [
      'inappropriate', 'offensive', 'adult', 'explicit', 
      'gambling', 'violence', 'hate', 'drugs'
    ];
    
    const contentText = JSON.stringify(contentData).toLowerCase();
    
    sensitiveKeywords.forEach(keyword => {
      if (contentText.includes(keyword)) {
        flags.push(`contains_${keyword}`);
      }
    });
    
    // Add content type specific checks
    if (contentType === 'event') {
      // Check for age-appropriate content
      if (contentData.minAge < 0 || contentData.maxAge > 18) {
        flags.push('age_range_issue');
      }
      
      // Check for missing required fields
      if (!contentData.title || !contentData.location || !contentData.startDate) {
        flags.push('missing_required_fields');
      }
    }
    
    // Simulate async operation (100 ms delay)
    await new Promise<void>(res => setTimeout(() => res(), 100));
    
    return flags;
  };

  return {
    submitForModeration,
    approveContent,
    rejectContent,
    checkModerationStatus,
    pendingModerationCount,
    loading,
    error
  };
};

export default useUgcModeration;
