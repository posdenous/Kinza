import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface CommentListSkeletonProps {
  count?: number;
  testID?: string;
}

/**
 * Skeleton loading component for comment lists
 * Provides visual feedback while comments are loading
 * Implements fast_feedback_ui rule with animated shimmer effect
 */
const CommentListSkeleton: React.FC<CommentListSkeletonProps> = ({
  count = 3,
  testID = 'comment-list-skeleton'
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [animatedValue]);

  const shimmerOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const renderCommentSkeleton = (index: number) => (
    <View key={index} style={styles.commentContainer} testID={`${testID}-item-${index}`}>
      <View style={styles.commentHeader}>
        <Animated.View 
          style={[styles.avatar, { opacity: shimmerOpacity }]} 
        />
        <View style={styles.commentHeaderText}>
          <Animated.View 
            style={[styles.userName, { opacity: shimmerOpacity }]} 
          />
          <Animated.View 
            style={[styles.timestamp, { opacity: shimmerOpacity }]} 
          />
        </View>
      </View>
      <View style={styles.commentBody}>
        <Animated.View 
          style={[styles.commentLine, styles.commentLineLong, { opacity: shimmerOpacity }]} 
        />
        <Animated.View 
          style={[styles.commentLine, styles.commentLineMedium, { opacity: shimmerOpacity }]} 
        />
        <Animated.View 
          style={[styles.commentLine, styles.commentLineShort, { opacity: shimmerOpacity }]} 
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container} testID={testID}>
      {Array.from({ length: count }, (_, index) => renderCommentSkeleton(index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  commentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    marginRight: 12,
  },
  commentHeaderText: {
    flex: 1,
  },
  userName: {
    height: 14,
    backgroundColor: '#E0E0E0',
    borderRadius: 7,
    marginBottom: 4,
    width: '40%',
  },
  timestamp: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    width: '25%',
  },
  commentBody: {
    gap: 6,
  },
  commentLine: {
    height: 14,
    backgroundColor: '#E0E0E0',
    borderRadius: 7,
  },
  commentLineLong: {
    width: '95%',
  },
  commentLineMedium: {
    width: '80%',
  },
  commentLineShort: {
    width: '60%',
  },
});

export default CommentListSkeleton;
