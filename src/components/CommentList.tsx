import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useFirestoreInstance } from '../hooks/useFirestoreInstance';
import { useUserCity } from '../hooks/useCities';
import { useUserRole } from '../hooks/useUserRole';
import createCommentService from '../services/commentService';
import useUgcModeration from '../hooks/useUgcModeration';
import ModerationWrapper from './ModerationWrapper';
import theme from '../styles/theme';

// Types
interface Comment {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: any;
  updatedAt?: any;
  isVisible: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  cityId: string;
  likes?: number;
  replies?: Comment[];
}

interface CommentListProps {
  eventId: string;
  initialLimit?: number;
  loadMoreLimit?: number;
  showHeader?: boolean;
  onCommentCountChange?: (count: number) => void;
  testID?: string;
}

/**
 * Component for displaying paginated comments with load more functionality
 * Enforces UGC moderation and city scoping rules
 */
const CommentList: React.FC<CommentListProps> = ({
  eventId,
  initialLimit = 15,
  loadMoreLimit = 10,
  showHeader = true,
  onCommentCountChange,
  testID = 'comment-list',
}) => {
  const { t } = useTranslation();
  const [firestore] = useFirestoreInstance();
  const { currentCityId } = useUserCity();
  const { role } = useUserRole();
  const moderationHook = useUgcModeration();

  // State
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  // Comment service
  const commentService = createCommentService({
    firestore,
    cityId: currentCityId,
    moderationService: moderationHook,
  });

  // Load initial comments
  const loadComments = async (refresh = false) => {
    if (!eventId || !firestore || !currentCityId) return;

    try {
      if (refresh) {
        setRefreshing(true);
        setOffset(0);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await commentService.getComments(eventId, {
        limit: initialLimit,
        offset: refresh ? 0 : offset,
        includeHidden: ['admin', 'organiser'].includes(role),
      });

      if (refresh) {
        setComments(result.comments);
        setOffset(result.nextOffset);
      } else {
        setComments(result.comments);
        setOffset(result.nextOffset);
      }

      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);

      // Notify parent of comment count change
      if (onCommentCountChange) {
        onCommentCountChange(result.totalCount);
      }
    } catch (err) {
      console.error('Error loading comments:', err);
      setError(t('comments.loadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load more comments
  const loadMoreComments = async () => {
    if (!hasMore || loadingMore || !eventId) return;

    try {
      setLoadingMore(true);
      setError(null);

      const result = await commentService.getComments(eventId, {
        limit: loadMoreLimit,
        offset: offset,
        includeHidden: ['admin', 'organiser'].includes(role),
      });

      setComments(prev => [...prev, ...result.comments]);
      setOffset(result.nextOffset);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Error loading more comments:', err);
      setError(t('comments.loadMoreError'));
    } finally {
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadComments();
  }, [eventId, currentCityId, role]);

  // Render individual comment
  const renderComment = ({ item }: { item: Comment }) => (
    <ModerationWrapper
      contentId={item.id}
      contentType="comment"
      key={item.id}
    >
      <View style={styles.commentItem} testID={`comment-${item.id}`}>
        <View style={styles.commentHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.userName?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{item.userName || t('comments.anonymousUser')}</Text>
              <Text style={styles.commentDate}>
                {item.createdAt?.toDate ? 
                  item.createdAt.toDate().toLocaleDateString() : 
                  t('comments.justNow')
                }
              </Text>
            </View>
          </View>
          {['admin', 'organiser'].includes(role) && (
            <View style={styles.moderationBadge}>
              <Text style={[
                styles.moderationText,
                item.moderationStatus === 'approved' && styles.approvedText,
                item.moderationStatus === 'pending' && styles.pendingText,
                item.moderationStatus === 'rejected' && styles.rejectedText,
              ]}>
                {t(`comments.moderation.${item.moderationStatus}`)}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.commentContent}>{item.content}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={16} color={theme.colors.text.light} />
            <Text style={styles.actionText}>{item.likes || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={16} color={theme.colors.text.light} />
            <Text style={styles.actionText}>{t('comments.reply')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="flag-outline" size={16} color={theme.colors.text.light} />
            <Text style={styles.actionText}>{t('comments.report')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ModerationWrapper>
  );

  // Render load more button
  const renderLoadMore = () => {
    if (!hasMore) return null;

    return (
      <TouchableOpacity
        style={styles.loadMoreButton}
        onPress={loadMoreComments}
        disabled={loadingMore}
        testID="load-more-comments"
      >
        {loadingMore ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <>
            <Ionicons name="chevron-down" size={20} color={theme.colors.primary} />
            <Text style={styles.loadMoreText}>
              {t('comments.loadMore', { 
                remaining: Math.min(loadMoreLimit, totalCount - comments.length) 
              })}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  // Render header with comment count
  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <View style={styles.header} testID="comment-list-header">
        <Text style={styles.headerTitle}>
          {t('comments.title')} ({totalCount})
        </Text>
        {totalCount > 0 && (
          <Text style={styles.headerSubtitle}>
            {t('comments.showing', { 
              shown: comments.length, 
              total: totalCount 
            })}
          </Text>
        )}
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState} testID="comment-list-empty">
      <Ionicons name="chatbubbles-outline" size={48} color={theme.colors.text.light} />
      <Text style={styles.emptyTitle}>{t('comments.noComments')}</Text>
      <Text style={styles.emptySubtitle}>{t('comments.beTheFirst')}</Text>
    </View>
  );

  // Render error state
  const renderError = () => (
    <View style={styles.errorState} testID="comment-list-error">
      <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
      <Text style={styles.errorTitle}>{t('comments.errorTitle')}</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => loadComments()}>
        <Text style={styles.retryText}>{t('common.retry')}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer} testID="comment-list-loading">
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>{t('comments.loading')}</Text>
      </View>
    );
  }

  if (error && comments.length === 0) {
    return renderError();
  }

  return (
    <View style={styles.container} testID={testID}>
      {renderHeader()}
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderLoadMore}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadComments(true)}
            colors={[theme.colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.heading,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text.light,
  },
  listContent: {
    paddingBottom: theme.spacing[4],
  },
  commentItem: {
    padding: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[2],
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[3],
  },
  avatarText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.heading,
    color: theme.colors.white,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.heading,
    color: theme.colors.text.primary,
  },
  commentDate: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text.light,
    marginTop: 2,
  },
  moderationBadge: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: 12,
    backgroundColor: theme.colors.background,
  },
  moderationText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.body,
    textTransform: 'uppercase',
  },
  approvedText: {
    color: theme.colors.success,
  },
  pendingText: {
    color: theme.colors.warning,
  },
  rejectedText: {
    color: theme.colors.error,
  },
  commentContent: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text.primary,
    lineHeight: 22,
    marginBottom: theme.spacing[3],
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing[4],
    paddingVertical: theme.spacing[1],
  },
  actionText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text.light,
    marginLeft: theme.spacing[1],
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[4],
    margin: theme.spacing[4],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
  },
  loadMoreText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.primary,
    marginLeft: theme.spacing[2],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[6],
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.heading,
    color: theme.colors.text.primary,
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[2],
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text.light,
    textAlign: 'center',
  },
  errorState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[6],
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.heading,
    color: theme.colors.error,
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[2],
  },
  errorMessage: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text.light,
    textAlign: 'center',
    marginBottom: theme.spacing[4],
  },
  retryButton: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
  },
  retryText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.white,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[6],
  },
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text.light,
    marginTop: theme.spacing[3],
  },
});

export default CommentList;
