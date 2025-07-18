import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useScreenshot } from '../utils/screenshot';
import theme from '../styles/theme';
import useFocusState from '../hooks/useFocusState';
import { withStyleFallback, withColorFallback, withFontFallback } from '../utils/styleUtils';

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
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { focusHandlers, focusStyles } = useFocusState();
  
  // Bounce animation for button press
  const animateScale = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();
  };

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
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        style={withStyleFallback([styles.button, style, focusStyles], { 
          backgroundColor: '#E06B8B', // Fallback to our primary color
          borderRadius: 16,
          padding: 12,
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 44
        })} 
        onPress={() => {
          animateScale();
          handleScreenshot();
        }}
        accessibilityLabel="Take screenshot"
        accessibilityHint="Saves a screenshot to your desktop"
        accessible={true}
        accessibilityRole="button"
        {...focusHandlers}
      >
        <Ionicons name="camera-outline" size={20} color={theme.colors.text.inverse} style={styles.icon} aria-label="Camera" />
        <Text style={styles.text}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.borders.radius.xl, // 16px corner radius per requirements
    minHeight: theme.layout.touchableMinHeight, // Ensure 44px minimum height for accessibility
    ...theme.shadows.md, // Add soft shadow per requirements
  },
  icon: {
    marginRight: theme.spacing[2],
  },
  text: {
    color: theme.colors.text.inverse,
    fontFamily: theme.typography.fontFamily.heading, // Poppins bold for buttons per requirements
    fontSize: theme.typography.fontSize.base, // 16px for text per requirements
  },
});

export default ScreenshotButton;
