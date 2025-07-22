import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface StatCardSkeletonProps {
  compact?: boolean;
  testID?: string;
}

/**
 * Skeleton loading component for statistic cards
 * Shows animated shimmer effect while data is loading
 */
const StatCardSkeleton: React.FC<StatCardSkeletonProps> = ({ 
  compact = false,
  testID = 'stat-card-skeleton'
}) => {
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const shimmer = () => {
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => shimmer());
    };

    shimmer();
  }, [shimmerAnim]);

  const shimmerStyle = {
    opacity: shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  return (
    <View style={[styles.container, compact && styles.compactContainer]} testID={testID}>
      <Animated.View style={[styles.shimmer, shimmerStyle]}>
        {/* Number placeholder */}
        <View style={[styles.numberPlaceholder, compact && styles.compactNumber]} />
        
        {/* Label placeholder */}
        <View style={[styles.labelPlaceholder, compact && styles.compactLabel]} />
        
        {/* Optional subtitle placeholder */}
        {!compact && <View style={styles.subtitlePlaceholder} />}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0.48,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 120,
    justifyContent: 'center',
  },
  compactContainer: {
    minHeight: 80,
    padding: 12,
  },
  shimmer: {
    width: '100%',
    alignItems: 'center',
  },
  numberPlaceholder: {
    width: 60,
    height: 32,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 12,
  },
  compactNumber: {
    width: 40,
    height: 24,
    marginBottom: 8,
  },
  labelPlaceholder: {
    width: '80%',
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  compactLabel: {
    width: '70%',
    height: 12,
    marginBottom: 4,
  },
  subtitlePlaceholder: {
    width: '60%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
});

export default StatCardSkeleton;
