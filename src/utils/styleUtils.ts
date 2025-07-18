/**
 * Style utilities for graceful fallbacks and immediate UI updates
 */

/**
 * Safely applies styles with fallbacks for undefined values
 * @param styles - Array of style objects
 * @param fallbacks - Fallback style object
 * @returns Combined style object with fallbacks applied
 */
export const withStyleFallback = (styles: any[], fallbacks: any = {}) => {
  // Filter out undefined or null styles
  const validStyles = styles.filter(style => style !== undefined && style !== null);
  
  // If no valid styles, return fallbacks
  if (validStyles.length === 0) {
    return fallbacks;
  }
  
  // Merge all valid styles with fallbacks as base
  return [fallbacks, ...validStyles];
};

/**
 * Safely applies a theme property with fallback
 * @param themeValue - Theme value that might be undefined
 * @param fallbackValue - Fallback value
 * @returns Theme value or fallback
 */
export const withThemeFallback = <T>(themeValue: T | undefined, fallbackValue: T): T => {
  return themeValue !== undefined ? themeValue : fallbackValue;
};

/**
 * Safely applies a font family with fallback
 * @param fontFamily - Font family that might be undefined
 * @returns Font family or system font fallback
 */
export const withFontFallback = (fontFamily: string | undefined): string => {
  if (!fontFamily) {
    // System font fallbacks
    return Platform.OS === 'ios' ? 'System' : 'Roboto';
  }
  return fontFamily;
};

/**
 * Safely applies a color with fallback
 * @param color - Color that might be undefined
 * @param fallbackColor - Fallback color
 * @returns Color or fallback
 */
export const withColorFallback = (color: string | undefined, fallbackColor: string = '#000000'): string => {
  return color || fallbackColor;
};

// Export a Platform import for the withFontFallback function
import { Platform } from 'react-native';
