/**
 * Kinza Design System - Style Utilities
 * 
 * This file contains utility functions for applying consistent styles throughout the application.
 * These functions help maintain design consistency and reduce repetitive style code.
 */

import { TextStyle, ViewStyle } from 'react-native';
import * as theme from './theme';

type SpacingKey = keyof typeof theme.spacing;
type FontSizeKey = keyof typeof theme.typography.fontSize;
type RadiusKey = keyof typeof theme.borders.radius;
type ColorKey = 'primary' | 'secondary' | 'accent';
type TextColorKey = 'dark' | 'light' | 'inverse';
type UIColorKey = keyof typeof theme.colors.ui;
type ShadowKey = keyof typeof theme.shadows;
type TypographyVariant = 'heading' | 'body' | 'button';

/**
 * Apply consistent spacing as margin
 */
export const applyMargin = (size: SpacingKey): ViewStyle => ({
  margin: theme.spacing[size],
});

/**
 * Apply consistent spacing as padding
 */
export const applyPadding = (size: SpacingKey): ViewStyle => ({
  padding: theme.spacing[size],
});

/**
 * Apply consistent spacing as margin in specific directions
 */
export const applyMarginDirectional = (
  vertical?: SpacingKey,
  horizontal?: SpacingKey,
  top?: SpacingKey,
  right?: SpacingKey,
  bottom?: SpacingKey,
  left?: SpacingKey,
): ViewStyle => {
  const style: ViewStyle = {};
  
  if (vertical !== undefined) {
    style.marginVertical = theme.spacing[vertical];
  }
  
  if (horizontal !== undefined) {
    style.marginHorizontal = theme.spacing[horizontal];
  }
  
  if (top !== undefined) {
    style.marginTop = theme.spacing[top];
  }
  
  if (right !== undefined) {
    style.marginRight = theme.spacing[right];
  }
  
  if (bottom !== undefined) {
    style.marginBottom = theme.spacing[bottom];
  }
  
  if (left !== undefined) {
    style.marginLeft = theme.spacing[left];
  }
  
  return style;
};

/**
 * Apply consistent spacing as padding in specific directions
 */
export const applyPaddingDirectional = (
  vertical?: SpacingKey,
  horizontal?: SpacingKey,
  top?: SpacingKey,
  right?: SpacingKey,
  bottom?: SpacingKey,
  left?: SpacingKey,
): ViewStyle => {
  const style: ViewStyle = {};
  
  if (vertical !== undefined) {
    style.paddingVertical = theme.spacing[vertical];
  }
  
  if (horizontal !== undefined) {
    style.paddingHorizontal = theme.spacing[horizontal];
  }
  
  if (top !== undefined) {
    style.paddingTop = theme.spacing[top];
  }
  
  if (right !== undefined) {
    style.paddingRight = theme.spacing[right];
  }
  
  if (bottom !== undefined) {
    style.paddingBottom = theme.spacing[bottom];
  }
  
  if (left !== undefined) {
    style.paddingLeft = theme.spacing[left];
  }
  
  return style;
};

/**
 * Apply consistent typography styles
 */
export const applyTypography = (variant: TypographyVariant, size: FontSizeKey = 'base'): TextStyle => {
  const style: TextStyle = {
    fontFamily: theme.typography.fontFamily[variant],
    fontSize: theme.typography.fontSize[size],
  };
  
  // Apply additional styling based on variant
  if (variant === 'heading') {
    style.fontWeight = 'bold';
  }
  
  return style;
};

/**
 * Apply consistent text color
 */
export const applyTextColor = (colorKey: TextColorKey): TextStyle => ({
  color: theme.colors.text[colorKey],
});

/**
 * Apply consistent border radius
 */
export const applyBorderRadius = (size: RadiusKey): ViewStyle => ({
  borderRadius: theme.borders.radius[size],
});

/**
 * Apply consistent shadow
 */
export const applyShadow = (size: ShadowKey): ViewStyle => ({
  ...theme.shadows[size],
});

/**
 * Apply consistent border
 */
export const applyBorder = (
  width: number = 1,
  color: UIColorKey = 'border',
  radius?: RadiusKey,
): ViewStyle => {
  const style: ViewStyle = {
    borderWidth: width,
    borderColor: theme.colors.ui[color],
  };
  
  if (radius !== undefined) {
    style.borderRadius = theme.borders.radius[radius];
  }
  
  return style;
};

/**
 * Apply consistent background color
 */
export const applyBackgroundColor = (color: UIColorKey | ColorKey): ViewStyle => {
  if (color in theme.colors.ui) {
    return { backgroundColor: theme.colors.ui[color as UIColorKey] };
  }
  
  return { backgroundColor: theme.colors[color as ColorKey] };
};

/**
 * Apply consistent flex layout
 */
export const applyFlex = (
  direction: 'row' | 'column' = 'column',
  justify: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' = 'flex-start',
  align: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline' = 'stretch',
  flex: number = 1,
): ViewStyle => ({
  flexDirection: direction,
  justifyContent: justify,
  alignItems: align,
  flex,
});

/**
 * Apply consistent touch target size for accessibility
 */
export const applyAccessibleTouchTarget = (): ViewStyle => ({
  minHeight: theme.layout.touchableMinHeight,
  minWidth: theme.layout.touchableMinWidth,
});

/**
 * Apply consistent card container style
 */
export const applyCardStyle = (withShadow: boolean = true): ViewStyle => {
  const style: ViewStyle = {
    backgroundColor: theme.colors.ui.card,
    borderRadius: theme.borders.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.ui.border,
    overflow: 'hidden',
  };
  
  if (withShadow) {
    Object.assign(style, theme.shadows.md);
  }
  
  return style;
};

/**
 * Apply consistent form input style
 */
export const applyInputStyle = (hasError: boolean = false): ViewStyle => {
  const style: ViewStyle = {
    backgroundColor: theme.colors.ui.input,
    borderRadius: theme.borders.radius.md,
    borderWidth: 1,
    borderColor: hasError ? theme.colors.ui.error : theme.colors.ui.border,
    padding: theme.spacing[3],
    minHeight: 48,
  };
  
  return style;
};
