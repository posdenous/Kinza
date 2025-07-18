import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import theme from '../../styles/theme';

interface LoadingIndicatorProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  timeout?: number;
  onTimeout?: () => void;
  testID?: string;
}

/**
 * Reusable loading indicator component with timeout handling
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'small',
  color = theme.colors.primary,
  text,
  timeout = 0, // 0 means no timeout
  onTimeout,
  testID = 'loading-indicator',
}) => {
  const { t } = useTranslation();
  const [hasTimedOut, setHasTimedOut] = useState<boolean>(false);
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        setHasTimedOut(true);
        if (onTimeout) {
          onTimeout();
        }
      }, timeout);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeout, onTimeout]);
  
  const displayText = text || t('common.loading');
  
  return (
    <View style={styles.container} testID={testID}>
      <ActivityIndicator size={size} color={color} />
      {displayText && (
        <Text style={[styles.text, { color: theme.colors.text.light }]}>
          {displayText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  text: {
    marginTop: theme.spacing[2],
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.body,
    textAlign: 'center',
  },
});

export default LoadingIndicator;
