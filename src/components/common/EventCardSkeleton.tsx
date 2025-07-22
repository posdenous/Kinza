import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import theme from '../../styles/theme';

interface EventCardSkeletonProps {
  compact?: boolean;
  testID?: string;
}

/**
 * Skeleton loading component for EventCard
 * Provides visual feedback while event data is loading
 */
const EventCardSkeleton: React.FC<EventCardSkeletonProps> = ({
  compact = false,
  testID = 'event-card-skeleton',
}) => {
  const shimmerAnimation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };

    shimmer();
  }, [shimmerAnimation]);

  const shimmerStyle = {
    opacity: shimmerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  return (
    <View 
      style={[styles.container, compact && styles.compactContainer]} 
      testID={testID}
    >
      {/* Image Skeleton */}
      <Animated.View 
        style={[
          styles.imageSkeleton, 
          compact && styles.compactImageSkeleton,
          shimmerStyle
        ]} 
      />

      {/* Content Skeleton */}
      <View style={[styles.contentContainer, compact && styles.compactContentContainer]}>
        {/* Date/Time Row */}
        <View style={styles.metaRow}>
          <Animated.View style={[styles.iconSkeleton, shimmerStyle]} />
          <Animated.View style={[styles.shortTextSkeleton, shimmerStyle]} />
        </View>

        {/* Title */}
        <Animated.View 
          style={[
            styles.titleSkeleton, 
            compact && styles.compactTitleSkeleton,
            shimmerStyle
          ]} 
        />
        
        {!compact && (
          <Animated.View style={[styles.titleSkeletonSecondLine, shimmerStyle]} />
        )}

        {/* Location Row */}
        <View style={styles.metaRow}>
          <Animated.View style={[styles.iconSkeleton, shimmerStyle]} />
          <Animated.View style={[styles.mediumTextSkeleton, shimmerStyle]} />
        </View>

        {/* Categories Row */}
        <View style={styles.categoriesRow}>
          <Animated.View style={[styles.categoryTagSkeleton, shimmerStyle]} />
          <Animated.View style={[styles.categoryTagSkeleton, shimmerStyle]} />
          {!compact && (
            <Animated.View style={[styles.categoryTagSkeleton, shimmerStyle]} />
          )}
        </View>

        {/* Price Row */}
        <View style={styles.metaRow}>
          <Animated.View style={[styles.iconSkeleton, shimmerStyle]} />
          <Animated.View style={[styles.shortTextSkeleton, shimmerStyle]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.ui.background,
    borderRadius: theme.borders.radius.lg,
    marginBottom: theme.spacing[3],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  compactContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing[2],
  },
  imageSkeleton: {
    width: '100%',
    height: 200,
    backgroundColor: '#E1E9EE',
    borderTopLeftRadius: theme.borders.radius.lg,
    borderTopRightRadius: theme.borders.radius.lg,
  },
  compactImageSkeleton: {
    width: 100,
    height: 100,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: theme.borders.radius.lg,
  },
  contentContainer: {
    padding: theme.spacing[3],
  },
  compactContentContainer: {
    flex: 1,
    padding: theme.spacing[2],
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  categoriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  iconSkeleton: {
    width: 16,
    height: 16,
    backgroundColor: '#E1E9EE',
    borderRadius: 8,
    marginRight: theme.spacing[1],
  },
  shortTextSkeleton: {
    width: 80,
    height: 12,
    backgroundColor: '#E1E9EE',
    borderRadius: 6,
  },
  mediumTextSkeleton: {
    width: 120,
    height: 12,
    backgroundColor: '#E1E9EE',
    borderRadius: 6,
  },
  titleSkeleton: {
    width: '90%',
    height: 16,
    backgroundColor: '#E1E9EE',
    borderRadius: 8,
    marginBottom: theme.spacing[1],
  },
  compactTitleSkeleton: {
    height: 14,
    marginBottom: theme.spacing[1],
  },
  titleSkeletonSecondLine: {
    width: '60%',
    height: 16,
    backgroundColor: '#E1E9EE',
    borderRadius: 8,
    marginBottom: theme.spacing[2],
  },
  categoryTagSkeleton: {
    width: 60,
    height: 20,
    backgroundColor: '#E1E9EE',
    borderRadius: theme.borders.radius.md,
    marginRight: theme.spacing[1],
  },
});

export default EventCardSkeleton;
