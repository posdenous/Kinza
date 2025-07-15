import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import useUgcModeration, { ContentType } from '../hooks/useUgcModeration';
import { useUserRole } from '../hooks/useUserRole';

interface ModerationWrapperProps {
  contentId: string;
  contentType: ContentType;
  children: React.ReactNode;
  onModerate?: () => void;
  showPendingMessage?: boolean;
}

/**
 * Component that wraps content that needs moderation
 * Only shows the content if it's approved or if the user is an admin/organiser
 */
const ModerationWrapper: React.FC<ModerationWrapperProps> = ({
  contentId,
  contentType,
  children,
  onModerate,
  showPendingMessage = true,
}) => {
  const { t } = useTranslation();
  const { checkModerationStatus } = useUgcModeration();
  const { userRole } = useUserRole();
  
  const [moderationStatus, setModerationStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if user can see unmoderated content
  const canSeeUnmoderated = ['admin', 'organiser'].includes(userRole);

  useEffect(() => {
    const fetchModerationStatus = async () => {
      if (!contentId) {
        setLoading(false);
        return;
      }

      try {
        const status = await checkModerationStatus(contentType, contentId);
        setModerationStatus(status);
      } catch (err) {
        console.error('Error checking moderation status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchModerationStatus();
  }, [contentId, contentType, checkModerationStatus]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#2196F3" />
      </View>
    );
  }

  // If content is approved or user is admin/organiser, show the content
  if (moderationStatus === 'approved' || canSeeUnmoderated) {
    // For admins/organisers, show moderation status badge if content is pending
    if (canSeeUnmoderated && moderationStatus === 'pending') {
      return (
        <View>
          <View style={styles.pendingBadge}>
            <Ionicons name="time-outline" size={14} color="#FFFFFF" />
            <Text style={styles.pendingText}>{t('moderation.pendingReview')}</Text>
            {onModerate && (
              <TouchableOpacity onPress={onModerate} style={styles.moderateButton}>
                <Text style={styles.moderateButtonText}>{t('moderation.moderate')}</Text>
              </TouchableOpacity>
            )}
          </View>
          {children}
        </View>
      );
    }
    
    // For admins/organisers, show rejected badge if content is rejected
    if (canSeeUnmoderated && moderationStatus === 'rejected') {
      return (
        <View>
          <View style={styles.rejectedBadge}>
            <Ionicons name="close-circle-outline" size={14} color="#FFFFFF" />
            <Text style={styles.rejectedText}>{t('moderation.rejected')}</Text>
            {onModerate && (
              <TouchableOpacity onPress={onModerate} style={styles.moderateButton}>
                <Text style={styles.moderateButtonText}>{t('moderation.moderate')}</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.rejectedContent}>
            {children}
          </View>
        </View>
      );
    }
    
    // Normal approved content or admin viewing
    return <>{children}</>;
  }
  
  // Content is pending moderation and user is not admin/organiser
  if (moderationStatus === 'pending' && showPendingMessage) {
    return (
      <View style={styles.pendingContainer}>
        <Ionicons name="time-outline" size={24} color="#FFC107" />
        <Text style={styles.pendingMessage}>{t('moderation.contentPendingReview')}</Text>
      </View>
    );
  }
  
  // Content is rejected and user is not admin/organiser
  if (moderationStatus === 'rejected') {
    return null; // Don't show rejected content to regular users
  }
  
  // Content has no moderation status yet (should not happen in normal flow)
  return null;
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingContainer: {
    padding: 16,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  pendingMessage: {
    marginLeft: 8,
    color: '#F57C00',
    fontSize: 14,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC107',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  pendingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  rejectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  rejectedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  rejectedContent: {
    opacity: 0.6,
  },
  moderateButton: {
    marginLeft: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  moderateButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ModerationWrapper;
