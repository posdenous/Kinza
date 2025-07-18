/**
 * i18n Configuration
 * 
 * Sets up internationalization for the Kinza app
 * Enforces language completeness rule by loading all supported languages
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation resources
import en from './en.json';
import de from './de.json';
import it from './it.json';

// Storage key for persisting language preference
export const LANGUAGE_STORAGE_KEY = 'kinza_language_preference';

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English' },
  de: { name: 'German', nativeName: 'Deutsch' },
  it: { name: 'Italian', nativeName: 'Italiano' },
};

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

// Language detection function
const detectUserLanguage = async (): Promise<LanguageCode> => {
  try {
    // Try to get language from storage
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    
    if (storedLanguage && Object.keys(SUPPORTED_LANGUAGES).includes(storedLanguage)) {
      return storedLanguage as LanguageCode;
    }
    
    // Fall back to device language if available
    const deviceLanguage = 
      (navigator.languages && navigator.languages[0]) || 
      navigator.language || 
      'en';
    
    // Get language code without region (e.g. 'en-US' -> 'en')
    const languageCode = deviceLanguage.split('-')[0];
    
    // Check if the language is supported
    if (Object.keys(SUPPORTED_LANGUAGES).includes(languageCode)) {
      return languageCode as LanguageCode;
    }
    
    // Default to English
    return 'en';
  } catch (error) {
    console.error('Error detecting user language:', error);
    return 'en';
  }
};

// Initialize i18next
const initializeI18n = async () => {
  const userLanguage = await detectUserLanguage();
  
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        de: { translation: de },
        it: { translation: it },
      },
      lng: userLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      react: {
        useSuspense: false, // Prevents issues with SSR
      },
      // Debug mode in development
      debug: process.env.NODE_ENV === 'development',
      // Detect missing keys
      saveMissing: process.env.NODE_ENV === 'development',
      missingKeyHandler: (lng, ns, key) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Missing translation key: ${key} for language: ${lng}`);
        }
      },
    });
  
  return i18n;
};

export { i18n, initializeI18n };
export default i18n;
