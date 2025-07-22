import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StatCardSkeleton from './common/StatCardSkeleton';

interface StatCardWithSkeletonProps {
  loading?: boolean;
  title: string;
  value: number | string;
  subtitle?: string;
  backgroundColor?: string;
  textColor?: string;
  compact?: boolean;
  testID?: string;
}

/**
 * Wrapper component that shows StatCardSkeleton while loading
 * and actual stat card content when data is ready
 */
const StatCardWithSkeleton: React.FC<StatCardWithSkeletonProps> = ({
  loading = false,
  title,
  value,
  subtitle,
  backgroundColor = '#FFFFFF',
  textColor = '#333333',
  compact = false,
  testID = 'stat-card'
}) => {
  if (loading) {
    return <StatCardSkeleton compact={compact} testID={`${testID}-skeleton`} />;
  }

  return (
    <View 
      style={[
        styles.container, 
        compact && styles.compactContainer,
        { backgroundColor }
      ]} 
      testID={testID}
    >
      <Text style={[styles.value, { color: textColor }, compact && styles.compactValue]}>
        {value}
      </Text>
      <Text style={[styles.title, { color: textColor }, compact && styles.compactTitle]}>
        {title}
      </Text>
      {subtitle && !compact && (
        <Text style={[styles.subtitle, { color: textColor }]}>
          {subtitle}
        </Text>
      )}
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
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 8,
  },
  compactValue: {
    fontSize: 20,
    marginVertical: 4,
  },
  title: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  compactTitle: {
    fontSize: 10,
  },
  subtitle: {
    fontSize: 10,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8,
  },
});

export default StatCardWithSkeleton;
