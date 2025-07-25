/**
 * Kinza Design System - Theme Tokens
 * 
 * This file contains all the design tokens used throughout the application.
 * Always import from this file to ensure consistency across the app.
 */

// Color Palette - Matching Kinza Mockup Design
export const colors = {
  // Primary brand colors - vibrant and playful to match mockup
  primary: '#4ECDC4', // Teal - main brand color from mockup
  secondary: '#FF6B6B', // Coral - secondary brand color from mockup
  accent: '#FDCB6E', // Yellow - accent color from mockup
  tertiary: '#6C5CE7', // Purple - additional brand color from mockup
  
  // Text colors - ensuring WCAG AA compliance
  text: {
    dark: '#2d3748', // Darker for better contrast and modern look
    light: '#718096', // Lighter gray for secondary text
    inverse: '#FFFFFF', // For text on dark backgrounds
  },
  
  // Brand gradients - matching mockup aesthetic
  gradients: {
    primary: ['#4ECDC4', '#44A08D'], // Teal gradient
    secondary: ['#FF6B6B', '#FF8E8E'], // Coral gradient
    accent: ['#FDCB6E', '#E17055'], // Yellow to orange gradient
    tertiary: ['#6C5CE7', '#A29BFE'], // Purple gradient
    logo: ['#6C5CE7', '#FF6B6B'], // Logo gradient (purple to coral)
    background: ['#f8f9ff', '#e8f4f8'], // Light background gradient
    card: ['#FFFFFF', '#f8f9ff'], // Card gradient
  },
  
  // UI colors
  ui: {
    background: '#FFFFFF',
    card: '#FFFFFF',
    border: '#E5E7EB',
    input: '#F5F7FA',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
  },
};

// Typography
export const typography = {
  // Font families
  fontFamily: {
    heading: 'Poppins-Bold',
    body: 'Nunito-Regular',
    button: 'Poppins-Bold',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing
export const spacing = {
  px: 1,
  '0': 0,
  '1': 4,
  '2': 8,
  '3': 12,
  '4': 16,
  '5': 20,
  '6': 24,
  '8': 32,
  '10': 40,
  '12': 48,
  '16': 64,
};

// Borders
export const borders = {
  radius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
};

// Shadows
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// Animation
export const animation = {
  bounce: {
    transform: [
      { scale: 0.95 },
      { scale: 1.05 },
      { scale: 1.0 },
    ],
    duration: 300,
  },
};

// Layout
export const layout = {
  touchableMinHeight: 44, // Minimum height for touchable elements
};

// Export all theme tokens
const theme = {
  colors,
  typography,
  spacing,
  borders,
  shadows,
  animation,
  layout,
};

export default theme;
