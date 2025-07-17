import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useScreenshot } from '../utils/screenshot';

interface ScreenshotButtonProps {
  title?: string;
  style?: any;
}

/**
 * A button component that helps users take screenshots and save them to desktop
 */
export const ScreenshotButton: React.FC<ScreenshotButtonProps> = ({ 
  title = 'Save Screenshot', 
  style 
}) => {
  const { saveScreenshotToDesktop } = useScreenshot();

  const handleScreenshot = async () => {
    try {
      if (Platform.OS === 'macos') {
        // On macOS, we'll save instructions for using the built-in screenshot tool
        const result = await saveScreenshotToDesktop();
        
        if (result.success) {
          Alert.alert(
            'Screenshot Instructions',
            'Instructions saved to your desktop. Press Command (⌘) + Shift + 4 to capture a screenshot on your Mac.'
          );
        } else {
          Alert.alert('Error', 'Failed to save screenshot instructions.');
        }
      } else {
        Alert.alert(
          'Screenshot Tip',
          Platform.OS === 'ios' 
            ? 'Press the Side button and Volume Up button at the same time to take a screenshot.'
            : 'Press Power + Volume Down buttons simultaneously to take a screenshot.'
        );
      }
    } catch (error) {
      console.error('Screenshot error:', error);
      Alert.alert('Error', 'Failed to take screenshot');
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={handleScreenshot}
      accessibilityLabel="Take screenshot"
      accessibilityHint="Saves a screenshot to your desktop"
    >
      <Ionicons name="camera-outline" size={20} color="#FFFFFF" style={styles.icon} />
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ScreenshotButton;
