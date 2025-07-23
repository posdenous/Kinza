import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface SearchResultsSkeletonProps {
  count?: number;
  testID?: string;
}

/**
 * Skeleton loading component for search results
 * Provides visual feedback while search results are loading
 * Implements fast_feedback_ui rule with animated shimmer effect
 */
const SearchResultsSkeleton: React.FC<SearchResultsSkeletonProps> = ({
  count = 5,
  testID = 'search-results-skeleton'
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1200,
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
    outputRange: [0.3, 0.8],
  });

  const renderSearchResultSkeleton = (index: number) => (
    <View key={index} style={styles.resultContainer} testID={`${testID}-item-${index}`}>
      <Animated.View 
        style={[styles.resultImage, { opacity: shimmerOpacity }]} 
      />
      <View style={styles.resultContent}>
        <Animated.View 
          style={[styles.resultTitle, { opacity: shimmerOpacity }]} 
        />
        <Animated.View 
          style={[styles.resultDescription, { opacity: shimmerOpacity }]} 
        />
        <View style={styles.resultMeta}>
          <Animated.View 
            style={[styles.resultLocation, { opacity: shimmerOpacity }]} 
          />
          <Animated.View 
            style={[styles.resultDate, { opacity: shimmerOpacity }]} 
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container} testID={testID}>
      {Array.from({ length: count }, (_, index) => renderSearchResultSkeleton(index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  resultContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  resultTitle: {
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 8,
    width: '80%',
  },
  resultDescription: {
    height: 14,
    backgroundColor: '#E0E0E0',
    borderRadius: 7,
    marginBottom: 8,
    width: '95%',
  },
  resultMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLocation: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    width: '40%',
  },
  resultDate: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    width: '30%',
  },
});

export default SearchResultsSkeleton;
