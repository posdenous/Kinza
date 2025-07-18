/**
 * Accessibility utilities for ensuring WCAG AA compliance
 */

/**
 * Calculate the relative luminance of a color
 * Formula from WCAG 2.0: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 * @param hexColor - Hex color code (e.g. '#FF8FAB')
 * @returns Relative luminance value between 0 and 1
 */
export const getLuminance = (hexColor: string): number => {
  // Remove # if present
  const hex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  // Calculate luminance
  const R = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const G = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const B = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

/**
 * Calculate contrast ratio between two colors
 * Formula from WCAG 2.0: https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 * @param color1 - First hex color
 * @param color2 - Second hex color
 * @returns Contrast ratio between 1 and 21
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);
  
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if a color combination meets WCAG AA standards
 * @param foreground - Foreground color (text)
 * @param background - Background color
 * @param isLargeText - Whether the text is large (≥18pt or bold ≥14pt)
 * @returns Whether the combination is AA compliant
 */
export const isWCAGAACompliant = (
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
};

/**
 * Adjust a color to make it WCAG AA compliant against a background
 * @param color - Color to adjust
 * @param background - Background color
 * @param isLargeText - Whether the text is large
 * @returns Adjusted color that is AA compliant
 */
export const getAccessibleColor = (
  color: string,
  background: string,
  isLargeText: boolean = false
): string => {
  // If already compliant, return the original color
  if (isWCAGAACompliant(color, background, isLargeText)) {
    return color;
  }
  
  // Otherwise, return a safe fallback color
  const bgLuminance = getLuminance(background);
  return bgLuminance > 0.5 ? '#000000' : '#FFFFFF';
};
