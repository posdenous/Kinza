import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import theme from '../../styles/theme';

interface ErrorDisplayProps {
  message: string;
  icon?: string;
  iconSize?: number;
  iconColor?: string;
  onRetry?: () => void;
  retryText?: string;
  testID?: string;
}

/**
 * Reusable error display component with optional retry functionality
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  icon = 'alert-circle-outline',
  iconSize = 24,
  iconColor = theme.colors.error,
  onRetry,
  retryText,
  testID = 'error-display',
}) => {
  const { t } = useTranslation();
  
  return (
    <View style={styles.container} testID={testID}>
      <Ionicons name={icon as any} size={iconSize} color={iconColor} />
      <Text style={styles.message}>{message}</Text>
      
      {onRetry && (
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={retryText || t('common.retry')}
          testID={`${testID}-retry-button`}
        >
          <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>
            {retryText || t('common.retry')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  message: {
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[3],
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.body,
    color: theme.colors.text.dark,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.borders.radius.md,
    minHeight: theme.layout.touchableMinHeight,
  },
  retryButtonText: {
    marginLeft: theme.spacing[1],
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.heading,
    fontWeight: 'bold',
  },
});

export default ErrorDisplay;
