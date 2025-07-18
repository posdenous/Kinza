import { useState } from 'react';
import { StyleSheet } from 'react-native';
import theme from '../styles/theme';

/**
 * Hook to manage focus states for interactive elements
 * Provides styles and handlers for focus, hover, and active states
 */
export const useFocusState = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Focus event handlers
  const focusHandlers = {
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    onPressIn: () => setIsPressed(true),
    onPressOut: () => setIsPressed(false),
  };

  // Focus styles based on state
  const focusStyles = {
    // Focus outline style for keyboard navigation
    ...(isFocused && styles.focusVisible),
    // Optional hover style
    ...(isHovered && styles.hoverState),
    // Active/pressed state
    ...(isPressed && styles.activeState),
  };

  return {
    isFocused,
    isHovered,
    isPressed,
    focusHandlers,
    focusStyles,
  };
};

// Shared focus styles
const styles = StyleSheet.create({
  focusVisible: {
    borderWidth: 2,
    borderColor: theme.colors.secondary,
    borderStyle: 'solid',
  },
  hoverState: {
    opacity: 0.9,
  },
  activeState: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

export default useFocusState;
