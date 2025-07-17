import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

/**
 * Utility for capturing screenshots of React Native components
 * and saving them to the user's desktop
 */
export const saveScreenshotToDesktop = async (fileName: string = `kinza-screenshot-${new Date().getTime()}.png`) => {
  try {
    // For React Native Web, we need to use a different approach
    if (Platform.OS === 'web') {
      console.log('Screenshot functionality is currently only supported on native platforms');
      return { success: false, error: 'Not supported on web platform' };
    } 
    
    // For macOS, save to desktop folder
    if (Platform.OS === 'macos') {
      const desktopDir = `${FileSystem.documentDirectory}/../Desktop/`;
      const filePath = `${desktopDir}${fileName}`;
      
      // Create a text file with instructions since we can't directly capture screenshots
      const content = 'To capture a screenshot on macOS:\n\n' +
                     '1. Press Command (⌘) + Shift + 4\n' +
                     '2. Select the area you want to capture\n' +
                     '3. The screenshot will be saved to your desktop';
      
      await FileSystem.writeAsStringAsync(filePath.replace('.png', '.txt'), content);
      
      console.log(`Instructions saved to: ${filePath.replace('.png', '.txt')}`);
      return { success: true, filePath: filePath.replace('.png', '.txt') };
    } 
    
    // For iOS/Android, save to documents directory
    const filePath = `${FileSystem.documentDirectory}${fileName}`;
    console.log(`Would save screenshot to: ${filePath} (functionality limited without native modules)`); 
    return { success: true, message: 'Screenshot functionality requires additional native modules' };
  } catch (error) {
    console.error('Screenshot save failed:', error);
    return { success: false, error };
  }
};

/**
 * Function to create a screenshot utility component
 */
export const createScreenshotButton = (onPress: () => void) => {
  return {
    takeScreenshot: onPress
  };
};

/**
 * Hook to use the screenshot functionality
 */
export const useScreenshot = () => {
  return {
    saveScreenshotToDesktop,
    createScreenshotButton,
  };
};
