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
   * Get comments for an event
   * Enforces city scoping and moderation rules
   */
  const getComments = async (eventId: string, includeHidden: boolean = false): Promise<Comment[]> => {
    if (!firestore || !cityId) {
      throw new Error('Missing required dependencies');
    }

    const commentsRef = collection(firestore, 'comments');
    
    // Build query with city scoping
    let commentsQuery = query(
      commentsRef,
      where('eventId', '==', eventId),
      where('cityId', '==', cityId),
      orderBy('createdAt', 'desc')
    );
    
    // If not including hidden comments, filter by visibility
    if (!includeHidden) {
      commentsQuery = query(
        commentsQuery,
        where('isVisible', '==', true)
      );
    }
    
    const snapshot = await getDocs(commentsQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Comment));
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
    updateComment,
    deleteComment,
  };
};

export default createCommentService;
