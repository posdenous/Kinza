/**
 * Moderation Service
 * 
 * Centralizes all moderation-related data operations and business logic
 * Enforces city scoping and role-based access control
 */

import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  getDoc,
  serverTimestamp,
  Timestamp,
  Firestore
} from 'firebase/firestore';
import { User } from 'firebase/auth';

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

export interface ModerationOptions {
  autoApprove?: boolean;
  notifyOnApproval?: boolean;
  notifyOnRejection?: boolean;
  aiScreen?: (contentType: ContentType, contentData: any) => Promise<string[]>;
}

export interface ModerationServiceOptions {
  firestore: Firestore;
  currentUser: User | null;
  cityId: string;
  userRole: string;
}

/**
 * Creates a moderation service instance
 */
export const createModerationService = ({
  firestore,
  currentUser,
  cityId,
  userRole
}: ModerationServiceOptions) => {
  /**
   * Submit content for moderation
   */
  const submitForModeration = async (
    contentType: ContentType, 
    contentId: string, 
    contentData: any,
    options: ModerationOptions = {}
  ): Promise<boolean> => {
    if (!firestore || !currentUser || !cityId) {
      throw new Error('Missing required dependencies');
    }

    try {
      // Check if content is already in moderation queue
      const existingItem = await findModerationItem(contentType, contentId);
      
      if (existingItem) {
        // Update existing moderation item
        const moderationRef = doc(firestore, 'moderation', existingItem.id);
        await updateDoc(moderationRef, {
          contentData,
          status: 'pending',
          submittedAt: serverTimestamp(),
          moderatedBy: null,
          moderatedAt: null,
          reason: null,
        });
      } else {
        // Create new moderation item
        const moderationRef = collection(firestore, 'moderation');
        
        // Run AI screening if available
        let aiFlags: string[] = [];
        if (options.aiScreen) {
          try {
            aiFlags = await options.aiScreen(contentType, contentData);
          } catch (err) {
            console.error('Error in AI screening:', err);
          }
        }
        
        // Determine if content should be auto-approved
        const shouldAutoApprove = options.autoApprove || 
          (userRole === 'admin' || userRole === 'organiser');
        
        const moderationItem = {
          contentId,
          contentType,
          contentData,
          status: shouldAutoApprove ? 'approved' : 'pending',
          submittedBy: currentUser.uid,
          submittedAt: serverTimestamp(),
          cityId, // City scoping rule
          aiFlags: aiFlags.length > 0 ? aiFlags : null,
        };
        
        if (shouldAutoApprove) {
          moderationItem['moderatedBy'] = currentUser.uid;
          moderationItem['moderatedAt'] = serverTimestamp();
        }
        
        await addDoc(moderationRef, moderationItem);
        
        // Update the content's moderation status in its collection
        if (shouldAutoApprove) {
          await updateContentModerationStatus(contentType, contentId, 'approved');
        }
      }
      
      return true;
    } catch (err) {
      console.error('Error submitting for moderation:', err);
      throw err;
    }
  };

  /**
   * Approve content in moderation queue
   */
  const approveContent = async (moderationId: string): Promise<boolean> => {
    if (!firestore || !currentUser || !cityId) {
      throw new Error('Missing required dependencies');
    }
    
    // Check if user has permission to moderate
    if (userRole !== 'admin' && userRole !== 'organiser') {
      throw new Error('Unauthorized: Only admins and organisers can approve content');
    }
    
    try {
      const moderationRef = doc(firestore, 'moderation', moderationId);
      const moderationSnap = await getDoc(moderationRef);
      
      if (!moderationSnap.exists()) {
        throw new Error('Moderation item not found');
      }
      
      const moderationData = moderationSnap.data() as ModerationItem;
      
      // Enforce city scoping
      if (moderationData.cityId !== cityId) {
        throw new Error('Cannot moderate content from another city');
      }
      
      // Update moderation status
      await updateDoc(moderationRef, {
        status: 'approved',
        moderatedBy: currentUser.uid,
        moderatedAt: serverTimestamp(),
      });
      
      // Update the content's moderation status in its collection
      await updateContentModerationStatus(
        moderationData.contentType, 
        moderationData.contentId, 
        'approved'
      );
      
      return true;
    } catch (err) {
      console.error('Error approving content:', err);
      throw err;
    }
  };

  /**
   * Reject content in moderation queue
   */
  const rejectContent = async (moderationId: string, reason: string): Promise<boolean> => {
    if (!firestore || !currentUser || !cityId) {
      throw new Error('Missing required dependencies');
    }
    
    // Check if user has permission to moderate
    if (userRole !== 'admin' && userRole !== 'organiser') {
      throw new Error('Unauthorized: Only admins and organisers can reject content');
    }
    
    try {
      const moderationRef = doc(firestore, 'moderation', moderationId);
      const moderationSnap = await getDoc(moderationRef);
      
      if (!moderationSnap.exists()) {
        throw new Error('Moderation item not found');
      }
      
      const moderationData = moderationSnap.data() as ModerationItem;
      
      // Enforce city scoping
      if (moderationData.cityId !== cityId) {
        throw new Error('Cannot moderate content from another city');
      }
      
      // Update moderation status
      await updateDoc(moderationRef, {
        status: 'rejected',
        moderatedBy: currentUser.uid,
        moderatedAt: serverTimestamp(),
        reason: reason || 'Content does not meet community guidelines',
      });
      
      // Update the content's moderation status in its collection
      await updateContentModerationStatus(
        moderationData.contentType, 
        moderationData.contentId, 
        'rejected'
      );
      
      return true;
    } catch (err) {
      console.error('Error rejecting content:', err);
      throw err;
    }
  };

  /**
   * Check moderation status of content
   */
  const checkModerationStatus = async (contentType: ContentType, contentId: string): Promise<string | null> => {
    if (!firestore || !cityId) {
      throw new Error('Missing required dependencies');
    }
    
    try {
      const moderationRef = collection(firestore, 'moderation');
      const q = query(
        moderationRef,
        where('contentType', '==', contentType),
        where('contentId', '==', contentId),
        where('cityId', '==', cityId)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      // Get the most recent moderation item
      let latestItem: ModerationItem | null = null;
      let latestTimestamp: Timestamp | null = null;
      
      snapshot.forEach((doc) => {
        const data = doc.data() as ModerationItem;
        const timestamp = data.submittedAt;
        
        if (!latestTimestamp || timestamp > latestTimestamp) {
          latestItem = { ...data, id: doc.id };
          latestTimestamp = timestamp;
        }
      });
      
      return latestItem ? latestItem.status : null;
    } catch (err) {
      console.error('Error checking moderation status:', err);
      throw err;
    }
  };

  /**
   * Get pending moderation items
   */
  const getPendingModerationItems = async (): Promise<ModerationItem[]> => {
    if (!firestore || !cityId) {
      throw new Error('Missing required dependencies');
    }
    
    // Check if user has permission to view moderation queue
    if (userRole !== 'admin' && userRole !== 'organiser') {
      throw new Error('Unauthorized: Only admins and organisers can view moderation queue');
    }
    
    try {
      const moderationRef = collection(firestore, 'moderation');
      const q = query(
        moderationRef,
        where('status', '==', 'pending'),
        where('cityId', '==', cityId)
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ModerationItem));
    } catch (err) {
      console.error('Error getting pending moderation items:', err);
      throw err;
    }
  };

  /**
   * Get moderation item by ID
   */
  const getModerationItem = async (moderationId: string): Promise<ModerationItem | null> => {
    if (!firestore) {
      throw new Error('Missing Firestore instance');
    }
    
    try {
      const moderationRef = doc(firestore, 'moderation', moderationId);
      const moderationSnap = await getDoc(moderationRef);
      
      if (!moderationSnap.exists()) {
        return null;
      }
      
      const moderationData = moderationSnap.data() as ModerationItem;
      
      // Enforce city scoping
      if (moderationData.cityId !== cityId) {
        throw new Error('Cannot access moderation item from another city');
      }
      
      return {
        id: moderationSnap.id,
        ...moderationData
      };
    } catch (err) {
      console.error('Error getting moderation item:', err);
      throw err;
    }
  };

  /**
   * Find moderation item by content type and ID
   */
  const findModerationItem = async (contentType: ContentType, contentId: string): Promise<ModerationItem | null> => {
    if (!firestore || !cityId) {
      throw new Error('Missing required dependencies');
    }
    
    try {
      const moderationRef = collection(firestore, 'moderation');
      const q = query(
        moderationRef,
        where('contentType', '==', contentType),
        where('contentId', '==', contentId),
        where('cityId', '==', cityId)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }
      
      // Get the most recent moderation item
      let latestItem: ModerationItem | null = null;
      let latestTimestamp: Timestamp | null = null;
      
      snapshot.forEach((doc) => {
        const data = doc.data() as ModerationItem;
        const timestamp = data.submittedAt;
        
        if (!latestTimestamp || timestamp > latestTimestamp) {
          latestItem = { ...data, id: doc.id };
          latestTimestamp = timestamp;
        }
      });
      
      return latestItem;
    } catch (err) {
      console.error('Error finding moderation item:', err);
      throw err;
    }
  };

  /**
   * Update content's moderation status in its collection
   */
  const updateContentModerationStatus = async (
    contentType: ContentType, 
    contentId: string, 
    status: 'pending' | 'approved' | 'rejected'
  ): Promise<void> => {
    if (!firestore) {
      throw new Error('Missing Firestore instance');
    }
    
    try {
      let collectionName: string;
      
      switch (contentType) {
        case 'event':
          collectionName = 'events';
          break;
        case 'comment':
          collectionName = 'comments';
          break;
        case 'profile':
          collectionName = 'profiles';
          break;
        case 'venue':
          collectionName = 'venues';
          break;
        default:
          throw new Error(`Unknown content type: ${contentType}`);
      }
      
      const contentRef = doc(firestore, collectionName, contentId);
      
      await updateDoc(contentRef, {
        moderationStatus: status,
        isVisible: status === 'approved',
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(`Error updating ${contentType} moderation status:`, err);
      throw err;
    }
  };

  return {
    submitForModeration,
    approveContent,
    rejectContent,
    checkModerationStatus,
    getPendingModerationItems,
    getModerationItem,
    findModerationItem,
  };
};

export default createModerationService;
