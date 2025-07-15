import React, { useState } from 'react';
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
import { useFirestore } from 'react-firebase-hooks/firestore';
import { useUserCity } from '../hooks/useCities';
import useUgcModeration from '../hooks/useUgcModeration';

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
  const [firestore] = useFirestore();
  const auth = getAuth();
  const user = auth.currentUser;
  const { currentCityId } = useUserCity();
  const { submitForModeration } = useUgcModeration();
  
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmitComment = async () => {
    if (!comment.trim()) {
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
        style={styles.input}
        value={comment}
        onChangeText={setComment}
        placeholder={t('comments.placeholder')}
        placeholderTextColor="#999999"
        multiline
        maxLength={500}
      />
      <TouchableOpacity
        style={[styles.submitButton, !comment.trim() && styles.disabledButton]}
        onPress={handleSubmitComment}
        disabled={!comment.trim() || submitting}
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
