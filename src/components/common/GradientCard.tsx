import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import theme from '../../styles/theme';

interface GradientCardProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'tertiary' | 'card' | 'background';
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  shadow?: boolean;
  borderRadius?: keyof typeof theme.borders.radius;
}

/**
 * Enhanced card component with gradient backgrounds
 * Provides consistent styling throughout the app with playful gradients
 */
const GradientCard: React.FC<GradientCardProps> = ({
  children,
  variant = 'card',
  style,
  contentStyle,
  shadow = true,
  borderRadius = 'xl',
}) => {
  const radiusValue = theme.borders.radius[borderRadius];
  
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
      case 'background':
        return '#f8f9ff';
      default:
        return theme.colors.ui.card;
    }
  };

  return (
    <View style={[styles.container, shadow && theme.shadows.md, style]}>
      <View
        style={[
          styles.cardBackground,
          {
            borderRadius: radiusValue,
            backgroundColor: getBackgroundColor(),
          },
        ]}
      >
        <View style={[styles.content, contentStyle]}>
          {children}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borders.radius.xl,
  },
  cardBackground: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: theme.spacing[4],
  },
});

export default GradientCard;
