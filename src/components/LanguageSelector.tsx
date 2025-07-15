import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLanguage } from '../hooks/useLanguage';

interface LanguageSelectorProps {
  onLanguageSelected?: (language: string) => void;
}

/**
 * Component for selecting app language
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageSelected }) => {
  const { currentLanguage, languages, changeLanguage } = useLanguage();

  const handleLanguageSelect = async (languageCode: string) => {
    const success = await changeLanguage(languageCode);
    if (success && onLanguageSelected) {
      onLanguageSelected(languageCode);
    }
  };

  return (
    <View style={styles.container}>
      {languages.map((language) => (
        <TouchableOpacity
          key={language.code}
          style={[
            styles.languageButton,
            currentLanguage === language.code && styles.selectedLanguage
          ]}
          onPress={() => handleLanguageSelect(language.code)}
        >
          <Text
            style={[
              styles.languageText,
              currentLanguage === language.code && styles.selectedLanguageText
            ]}
          >
            {language.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  languageButton: {
    width: '100%',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  selectedLanguage: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  languageText: {
    fontSize: 18,
  },
  selectedLanguageText: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});

export default LanguageSelector;
