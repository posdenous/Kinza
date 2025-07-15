import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

interface InterestSelectionProps {
  onSave: (interests: string[]) => void;
}

/**
 * Component for selecting user interests during onboarding
 */
const InterestSelection: React.FC<InterestSelectionProps> = ({ onSave }) => {
  const { t } = useTranslation();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Available interest categories
  const interestCategories = [
    { id: 'playgrounds', icon: '🛝' },
    { id: 'cafes', icon: '☕' },
    { id: 'museums', icon: '🏛️' },
    { id: 'libraries', icon: '📚' },
    { id: 'parks', icon: '🌳' },
    { id: 'pools', icon: '🏊' },
    { id: 'theaters', icon: '🎭' },
    { id: 'zoos', icon: '🦁' },
    { id: 'indoor', icon: '🏠' },
    { id: 'art', icon: '🎨' },
    { id: 'music', icon: '🎵' },
    { id: 'nature', icon: '🌿' },
    { id: 'food', icon: '🍕' },
    { id: 'education', icon: '📝' },
    { id: 'sports', icon: '⚽' },
  ];

  const toggleInterest = (interestId: string) => {
    if (selectedInterests.includes(interestId)) {
      setSelectedInterests(selectedInterests.filter(id => id !== interestId));
    } else {
      setSelectedInterests([...selectedInterests, interestId]);
    }
  };

  const handleSave = () => {
    onSave(selectedInterests);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>{t('onboarding.interests')}</Text>
      
      <ScrollView style={styles.interestsContainer}>
        <View style={styles.interestGrid}>
          {interestCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.interestItem,
                selectedInterests.includes(category.id) && styles.selectedInterest
              ]}
              onPress={() => toggleInterest(category.id)}
            >
              <Text style={styles.interestIcon}>{category.icon}</Text>
              <Text style={styles.interestText}>
                {t(`venues.${category.id}`, category.id)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.saveButton,
          selectedInterests.length === 0 && styles.disabledButton
        ]}
        onPress={handleSave}
        disabled={selectedInterests.length === 0}
      >
        <Text style={styles.saveButtonText}>
          {t('common.save')} ({selectedInterests.length})
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  instruction: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  interestsContainer: {
    flex: 1,
    marginBottom: 16,
  },
  interestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  interestItem: {
    width: '30%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedInterest: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  interestIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 12,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
});

export default InterestSelection;
