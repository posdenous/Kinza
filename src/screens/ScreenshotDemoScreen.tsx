import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenshotButton from '../components/ScreenshotButton';

/**
 * Demo screen showing how to use the screenshot functionality
 */
const ScreenshotDemoScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="camera" size={32} color="#4A90E2" />
        <Text style={styles.title}>Screenshot Demo</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>How to Save Screenshots</Text>
        <Text style={styles.cardText}>
          This demo shows how to save screenshots to your desktop using the built-in 
          macOS screenshot functionality.
        </Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.stepTitle}>On macOS:</Text>
        <Text style={styles.step}>1. Press Command (⌘) + Shift + 4</Text>
        <Text style={styles.step}>2. Select the area you want to capture</Text>
        <Text style={styles.step}>3. The screenshot will be saved to your desktop</Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.stepTitle}>On iOS:</Text>
        <Text style={styles.step}>Press the Side button and Volume Up button simultaneously</Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.stepTitle}>On Android:</Text>
        <Text style={styles.step}>Press Power + Volume Down buttons simultaneously</Text>
      </View>

      <View style={styles.buttonContainer}>
        <ScreenshotButton title="Save Screenshot to Desktop" />
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Screenshot Tips</Text>
        <Text style={styles.cardText}>
          • To capture a specific window on macOS: Command (⌘) + Shift + 4, then press Space
        </Text>
        <Text style={styles.cardText}>
          • To capture the entire screen on macOS: Command (⌘) + Shift + 3
        </Text>
        <Text style={styles.cardText}>
          • Screenshots are automatically saved to your desktop
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#333',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  cardText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  step: {
    fontSize: 15,
    color: '#555',
    marginBottom: 6,
    paddingLeft: 8,
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
});

export default ScreenshotDemoScreen;
