/**
 * Comment Service
 * 
 * Centralizes all comment-related data operations and business logic
 * Enforces city scoping and moderation rules
 */

import { 
  addDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  getDoc,
  Firestore
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import useUgcModeration from '../hooks/useUgcModeration';

export interface Comment {
  id: string;
  eventId: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string | null;
  text: string;
  createdAt: any; // Firestore timestamp
  cityId: string;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  isVisible: boolean;
}

export interface CommentInput {
  text: string;
  eventId: string;
}

export interface CommentServiceOptions {
  firestore: Firestore;
  currentUser: User | null;
  cityId: string;
  moderationService: ReturnType<typeof useUgcModeration>;
}

// Enhanced comment pagination interface
interface CommentPaginationOptions {
  limit?: number;
  offset?: number;
  lastCommentId?: string;
  includeHidden?: boolean;
}

interface CommentPaginationResult {
  comments: Comment[];
  totalCount: number;
  hasMore: boolean;
  nextOffset: number;
}

/**
 * Creates a comment service instance
 */
export const createCommentService = ({
  firestore,
  currentUser,
  cityId,
  moderationService
}: CommentServiceOptions) => {
  const { submitForModeration, checkModerationStatus } = moderationService;
  
  /**
   * Add a new comment
   */
  const addComment = async (input: CommentInput): Promise<string> => {
    if (!firestore || !currentUser || !cityId) {
      throw new Error('Missing required dependencies');
    }

    // Create the comment document
    const commentsRef = collection(firestore, 'comments');
    const newComment = {
      eventId: input.eventId,
      userId: currentUser.uid,
      userDisplayName: currentUser.displayName || 'Anonymous',
      userPhotoURL: currentUser.photoURL || null,
      text: input.text.trim(),
      createdAt: serverTimestamp(),
      cityId: cityId, // City scoping rule
      moderationStatus: 'pending',
      isVisible: false, // Hidden until moderation approves
    };
    
    // Add to Firestore
    const commentDoc = await addDoc(commentsRef, newComment);
    
    // Submit for moderation
    await submitForModeration('comment', commentDoc.id, {
      ...newComment,
      id: commentDoc.id
    });
    
    return commentDoc.id;
  };

  /**
   * Get comments for an event with pagination support
   * Enforces city scoping and moderation rules
   */
  const getComments = async (
    eventId: string, 
    options: CommentPaginationOptions = {}
  ): Promise<CommentPaginationResult> => {
    if (!firestore || !cityId) {
      throw new Error('Missing required dependencies');
    }

    const {
      limit = 15,
      offset = 0,
      includeHidden = false
    } = options;

    const commentsRef = collection(firestore, 'comments');
    
    // First, get total count for the event
    let countQuery = query(
      commentsRef,
      where('eventId', '==', eventId),
      where('cityId', '==', cityId)
    );
    
    if (!includeHidden) {
      countQuery = query(countQuery, where('isVisible', '==', true));
    }
    
    const countSnapshot = await getDocs(countQuery);
    const totalCount = countSnapshot.size;
    
    // Build paginated query with city scoping
    let commentsQuery = query(
      commentsRef,
      where('eventId', '==', eventId),
      where('cityId', '==', cityId),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    // If not including hidden comments, filter by visibility
    if (!includeHidden) {
      commentsQuery = query(
        commentsRef,
        where('eventId', '==', eventId),
        where('cityId', '==', cityId),
        where('isVisible', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );
    }
    
    // Apply offset if provided (for pagination)
    if (offset > 0) {
      // For offset-based pagination, we need to skip documents
      // Note: Firestore doesn't have native offset, so we simulate it
      const skipQuery = query(
        commentsRef,
        where('eventId', '==', eventId),
        where('cityId', '==', cityId),
        ...(includeHidden ? [] : [where('isVisible', '==', true)]),
        orderBy('createdAt', 'desc'),
        limit(offset)
      );
      
      const skipSnapshot = await getDocs(skipQuery);
      if (skipSnapshot.docs.length > 0) {
        const lastDoc = skipSnapshot.docs[skipSnapshot.docs.length - 1];
        commentsQuery = query(
          commentsRef,
          where('eventId', '==', eventId),
          where('cityId', '==', cityId),
          ...(includeHidden ? [] : [where('isVisible', '==', true)]),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(limit)
        );
      }
    }
    
    const snapshot = await getDocs(commentsQuery);
    
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Comment));
    
    const hasMore = (offset + comments.length) < totalCount;
    const nextOffset = offset + comments.length;
    
    return {
      comments,
      totalCount,
      hasMore,
      nextOffset
    };
  };

  /**
   * Get a single comment by ID
   */
  const getComment = async (commentId: string): Promise<Comment | null> => {
    if (!firestore) {
      throw new Error('Missing Firestore instance');
    }

    const commentRef = doc(firestore, 'comments', commentId);
    const commentSnap = await getDoc(commentRef);
    
    if (!commentSnap.exists()) {
      return null;
    }
    
    // Enforce city scoping
    const commentData = commentSnap.data() as Comment;
    if (commentData.cityId !== cityId) {
      throw new Error('Comment not found in current city');
    }
    
    return {
      id: commentSnap.id,
      ...commentData
    } as Comment;
  };

  /**
   * Get comment count for an event (for display purposes)
   */
  const getCommentCount = async (eventId: string): Promise<number> => {
    if (!firestore || !cityId) {
      return 0;
    }

    const commentsRef = collection(firestore, 'comments');
    const countQuery = query(
      commentsRef,
      where('eventId', '==', eventId),
      where('cityId', '==', cityId),
      where('isVisible', '==', true)
    );
    
    const snapshot = await getDocs(countQuery);
    return snapshot.size;
  };

  /**
   * Update a comment
   * Only the author or admin/organiser can update
   */
  const updateComment = async (commentId: string, text: string): Promise<void> => {
    if (!firestore || !currentUser) {
      throw new Error('Missing required dependencies');
    }

    const comment = await getComment(commentId);
    
    if (!comment) {
      throw new Error('Comment not found');
    }
    
    // Check if user is author or has permission
    if (comment.userId !== currentUser.uid) {
      throw new Error('Not authorized to update this comment');
    }
    
    const commentRef = doc(firestore, 'comments', commentId);
    
    await updateDoc(commentRef, {
      text: text.trim(),
      updatedAt: serverTimestamp(),
      moderationStatus: 'pending', // Reset moderation status
      isVisible: false, // Hide until re-approved
    });
    
    // Submit for moderation again
    await submitForModeration('comment', commentId, {
      ...comment,
      text: text.trim(),
    });
  };

  /**
   * Delete a comment
   * Only the author or admin/organiser can delete
   */
  const deleteComment = async (commentId: string): Promise<void> => {
    if (!firestore || !currentUser) {
      throw new Error('Missing required dependencies');
    }

    const comment = await getComment(commentId);
    
    if (!comment) {
      throw new Error('Comment not found');
    }
    
    // Check if user is author or has permission
    if (comment.userId !== currentUser.uid) {
      throw new Error('Not authorized to delete this comment');
    }
    
    const commentRef = doc(firestore, 'comments', commentId);
    await deleteDoc(commentRef);
  };

  return {
    addComment,
    getComments,
    getComment,
    getCommentCount,
    updateComment,
    deleteComment,
  };
};

export default createCommentService;
