/**
 * Gradient Utilities
 * 
 * Helper functions for working with gradients in the Kinza app
 */

import { ViewStyle } from 'react-native';
import theme from '../styles/theme';

type ScreenType = 'home' | 'profile' | 'map';

/**
 * Creates a style object for applying a gradient background to a component
 * 
 * @param screenType - The type of screen ('home', 'profile', or 'map')
 * @returns A style object with the appropriate background color
 */
export const getGradientBackgroundStyle = (screenType: ScreenType): ViewStyle => {
  // For components that don't support gradients directly,
  // we use the first color in the gradient as a fallback
  return {
    backgroundColor: theme.colors.gradients[screenType][0],
  };
};
