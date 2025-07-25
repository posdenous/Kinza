import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../styles/theme';

interface KinzaLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  style?: any;
}

/**
 * Kinza Logo Component with gradient "K" and optional text
 * Matches the design from the mockup with purple-to-coral gradient
 */
const KinzaLogo: React.FC<KinzaLogoProps> = ({
  size = 'medium',
  showText = true,
  style,
}) => {
  const sizeConfig = {
    small: {
      logoSize: 32,
      fontSize: 14,
      textSize: theme.typography.fontSize.lg,
      borderRadius: theme.borders.radius.md,
    },
    medium: {
      logoSize: 48,
      fontSize: 20,
      textSize: theme.typography.fontSize['2xl'],
      borderRadius: theme.borders.radius.lg,
    },
    large: {
      logoSize: 64,
      fontSize: 28,
      textSize: theme.typography.fontSize['3xl'],
      borderRadius: theme.borders.radius.xl,
    },
  };

  const config = sizeConfig[size];

  return (
    <View style={[styles.container, style]}>
      {/* Brand K Logo */}
      <View
        style={[
          styles.logoContainer,
          {
            width: config.logoSize,
            height: config.logoSize,
            borderRadius: config.borderRadius,
            transform: [{ rotate: '-5deg' }],
            backgroundColor: theme.colors.primary, // Use primary teal color
          },
        ]}
      >
        <Text
          style={[
            styles.logoText,
            {
              fontSize: config.fontSize,
            },
          ]}
        >
          K
        </Text>
      </View>

      {/* Kinza Text */}
      {showText && (
        <Text
          style={[
            styles.brandText,
            {
              fontSize: config.textSize,
            },
          ]}
        >
          Kinza
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoText: {
    color: theme.colors.text.inverse,
    fontFamily: theme.typography.fontFamily.heading,
    fontWeight: '800',
    textAlign: 'center',
  },
  brandText: {
    color: theme.colors.text.dark,
    fontFamily: theme.typography.fontFamily.heading,
    fontWeight: '700',
  },
});

export default KinzaLogo;
