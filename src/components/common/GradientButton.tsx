import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import theme from '../../styles/theme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

/**
 * Enhanced button component with gradient backgrounds
 * Provides consistent, playful button styling throughout the app
 */
const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  testID,
}) => {
  const sizeConfig = {
    small: {
      paddingVertical: theme.spacing[2],
      paddingHorizontal: theme.spacing[4],
      fontSize: theme.typography.fontSize.sm,
      borderRadius: theme.borders.radius.lg,
    },
    medium: {
      paddingVertical: theme.spacing[3],
      paddingHorizontal: theme.spacing[6],
      fontSize: theme.typography.fontSize.base,
      borderRadius: theme.borders.radius.xl,
    },
    large: {
      paddingVertical: theme.spacing[4],
      paddingHorizontal: theme.spacing[8],
      fontSize: theme.typography.fontSize.lg,
      borderRadius: theme.borders.radius.xl,
    },
  };

  const config = sizeConfig[size];
  
  // Map variants to colors
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'accent':
        return theme.colors.accent;
      case 'tertiary':
        return theme.colors.tertiary;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          borderRadius: config.borderRadius,
          opacity: disabled ? 0.6 : 1,
          backgroundColor: getBackgroundColor(),
          paddingVertical: config.paddingVertical,
          paddingHorizontal: config.paddingHorizontal,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.colors.text.inverse} />
      ) : (
        <Text
          style={[
            styles.text,
            {
              fontSize: config.fontSize,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: theme.layout.touchableMinHeight,
    ...theme.shadows.md,
  },
  text: {
    color: theme.colors.text.inverse,
    fontFamily: theme.typography.fontFamily.button,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default GradientButton;
