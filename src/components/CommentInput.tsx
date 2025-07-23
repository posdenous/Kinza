import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestoreInstance } from '../hooks/useFirestoreInstance';
import { useUserCity } from '../hooks/useCities';
import useUgcModeration from '../hooks/useUgcModeration';
import { useSubmissionThrottle } from '../hooks/useSubmissionThrottle';

interface CommentInputProps {
  eventId: string;
  onCommentAdded?: () => void;
}

/**
 * Component for adding comments to events
 * Handles submission to Firestore and moderation queue
 */
const CommentInput: React.FC<CommentInputProps> = ({ eventId, onCommentAdded }) => {
  const { t } = useTranslation();
  const [firestore] = useFirestoreInstance();
  const auth = getAuth();
  const user = auth.currentUser;
  const { currentCityId } = useUserCity();
  const { submitForModeration } = useUgcModeration();
  const { canSubmit, recordSubmission, getRemainingSubmissions, getTimeUntilReset, isThrottled } = useSubmissionThrottle();
  
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [validation, setValidation] = useState<{
    isValid: boolean;
    errors: string[];
    characterCount: number;
    maxLength: number;
  }>({ isValid: false, errors: [], characterCount: 0, maxLength: 500 });

  // Validate comment in real-time
  useEffect(() => {
    const errors: string[] = [];
    const trimmedComment = comment.trim();
    const characterCount = trimmedComment.length;
    
    // Check for empty comment
    if (characterCount === 0) {
      errors.push(t('comments.errorEmpty'));
    }
    
    // Check for minimum length
    if (characterCount > 0 && characterCount < 3) {
      errors.push(t('comments.errorTooShort'));
    }
    
    // Check for maximum length
    if (characterCount > validation.maxLength) {
      errors.push(t('comments.errorTooLong', { max: validation.maxLength }));
    }
    
    // Check for inappropriate content (simple example)
    const inappropriateWords = ['inappropriate', 'offensive', 'spam']; // This would be more comprehensive in production
    if (inappropriateWords.some(word => trimmedComment.toLowerCase().includes(word))) {
      errors.push(t('comments.errorInappropriate'));
    }
    
    setValidation({
      isValid: errors.length === 0 && characterCount > 0,
      errors,
      characterCount,
      maxLength: validation.maxLength
    });
  }, [comment, t]);

  const handleSubmitComment = async () => {
    if (!validation.isValid) {
      return;
    }

    // Check submission throttle
    if (!canSubmit('comment')) {
      const remaining = getRemainingSubmissions('comment');
      const timeUntilReset = Math.ceil(getTimeUntilReset() / (1000 * 60)); // Convert to minutes
      
      Alert.alert(
        t('comments.throttleTitle'),
        t('comments.throttleMessage', { 
          remaining, 
          timeUntilReset,
          maxSubmissions: 5 
        }),
        [{ text: t('common.ok') }]
      );
      return;
    }

    if (!user) {
      Alert.alert(
        t('comments.loginRequired'),
        t('comments.loginToComment'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.login'), onPress: () => {/* Navigate to login */} }
        ]
      );
      return;
    }

    if (!firestore || !currentCityId) {
      Alert.alert(t('common.error'), t('common.tryAgainLater'));
      return;
    }

    setSubmitting(true);

    try {
      // Create the comment document
      const commentsRef = collection(firestore, 'comments');
      const newComment = {
        eventId,
        userId: user.uid,
        userDisplayName: user.displayName || 'Anonymous',
        userPhotoURL: user.photoURL || null,
        text: comment.trim(),
        createdAt: serverTimestamp(),
        cityId: currentCityId, // City scoping rule
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
      
      // Record successful submission for throttling
      recordSubmission('comment');
      
      // Clear input and notify parent
      setComment('');
      if (onCommentAdded) {
        onCommentAdded();
      }
      
      // Show success message
      Alert.alert(
        t('comments.submitted'),
        t('comments.moderationNotice'),
        [{ text: t('common.ok') }]
      );
    } catch (err) {
      console.error('Error submitting comment:', err);
      Alert.alert(
        t('common.error'),
        t('comments.submitError'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, !validation.isValid && comment.trim().length > 0 && styles.inputError]}
        value={comment}
        onChangeText={setComment}
        placeholder={t('comments.placeholder')}
        placeholderTextColor="#999999"
        multiline
        maxLength={validation.maxLength}
      />
      
      {/* Character counter */}
      <Text style={[styles.characterCount, 
        validation.characterCount > validation.maxLength * 0.8 && styles.characterCountWarning,
        validation.characterCount > validation.maxLength && styles.characterCountError
      ]}>
        {validation.characterCount}/{validation.maxLength}
      </Text>
      
      {/* Validation errors */}
      {validation.errors.length > 0 && comment.trim().length > 0 && (
        <View style={styles.validationContainer}>
          {validation.errors.map((error, index) => (
            <Text key={index} style={styles.validationError}>
              <Ionicons name="alert-circle-outline" size={14} color="#FF5722" /> {error}
            </Text>
          ))}
        </View>
      )}
      <TouchableOpacity
        style={[styles.submitButton, (!validation.isValid || submitting) && styles.disabledButton]}
        onPress={handleSubmitComment}
        disabled={!validation.isValid || submitting}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Ionicons name="send" size={20} color="#FFFFFF" />
        )}
      </TouchableOpacity>
      
      <Text style={styles.moderationNotice}>
        {t('comments.moderationInfo')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingRight: 50,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 40,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#FF5722',
    backgroundColor: '#FFF8F6',
  },
  validationContainer: {
    marginTop: 4,
    marginBottom: 8,
  },
  validationError: {
    color: '#FF5722',
    fontSize: 12,
    marginTop: 2,
  },
  characterCount: {
    position: 'absolute',
    right: 70,
    top: 16,
    fontSize: 10,
    color: '#999999',
  },
  characterCountWarning: {
    color: '#FF9800',
  },
  characterCountError: {
    color: '#FF5722',
  },
  submitButton: {
    position: 'absolute',
    right: 24,
    top: 24,
    backgroundColor: '#2196F3',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  moderationNotice: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default CommentInput;
