/**
 * Translation Context
 * 
 * Provides internationalization functionality throughout the app
 * Enforces language completeness rule by ensuring all UI strings exist in all supported locales
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation, initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import { useCity } from './CityContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English' },
  de: { name: 'German', nativeName: 'Deutsch' },
  it: { name: 'Italian', nativeName: 'Italiano' },
};

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

interface TranslationContextType {
  currentLanguage: LanguageCode;
  changeLanguage: (lang: LanguageCode) => Promise<void>;
  t: (key: string, options?: any) => string;
  isRTL: boolean;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
  isLoading: boolean;
  missingKeys: string[];
  validateTranslationCompleteness: () => Promise<boolean>;
}

// Create the context with a default value
const TranslationContext = createContext<TranslationContextType>({
  currentLanguage: 'en',
  changeLanguage: async () => {},
  t: (key: string) => key,
  isRTL: false,
  supportedLanguages: SUPPORTED_LANGUAGES,
  isLoading: true,
  missingKeys: [],
  validateTranslationCompleteness: async () => false,
});

interface TranslationProviderProps {
  children: ReactNode;
  defaultLanguage?: LanguageCode;
}

// Storage key for persisting language preference
const LANGUAGE_STORAGE_KEY = 'kinza_language_preference';

/**
 * Translation Provider Component
 * Manages translation state and provides it to the app
 */
export const TranslationProvider: React.FC<TranslationProviderProps> = ({ 
  children,
  defaultLanguage = 'en'
}) => {
  const { t, i18n } = useTranslation();
  const { currentCity } = useCity();
  
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(defaultLanguage);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [missingKeys, setMissingKeys] = useState<string[]>([]);
  
  // RTL languages (none in current supported languages, but added for future support)
  const rtlLanguages: LanguageCode[] = [];
  const isRTL = rtlLanguages.includes(currentLanguage);

  /**
   * Change the current language
   */
  const changeLanguage = async (lang: LanguageCode): Promise<void> => {
    try {
      await i18n.changeLanguage(lang);
      setCurrentLanguage(lang);
      
      // Persist language preference
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (err) {
      console.error('Error changing language:', err);
    }
  };

  /**
   * Validate that all translation keys exist in all supported languages
   * Enforces the language completeness rule
   */
  const validateTranslationCompleteness = async (): Promise<boolean> => {
    const allKeys = new Set<string>();
    const missingTranslations: string[] = [];
    
    // Collect all keys from all namespaces
    Object.keys(i18n.services.resourceStore.data).forEach(lang => {
      Object.keys(i18n.services.resourceStore.data[lang]).forEach(namespace => {
        const resources = i18n.services.resourceStore.data[lang][namespace];
        collectKeys(resources, '', allKeys);
      });
    });
    
    // Check if all keys exist in all languages
    Object.keys(SUPPORTED_LANGUAGES).forEach(lang => {
      allKeys.forEach(key => {
        const hasTranslation = i18n.exists(key, { lng: lang });
        if (!hasTranslation) {
          missingTranslations.push(`${lang}:${key}`);
        }
      });
    });
    
    setMissingKeys(missingTranslations);
    return missingTranslations.length === 0;
  };

  /**
   * Helper function to recursively collect all translation keys
   */
  const collectKeys = (obj: any, prefix: string, keys: Set<string>) => {
    Object.keys(obj).forEach(key => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        collectKeys(obj[key], fullKey, keys);
      } else {
        keys.add(fullKey);
      }
    });
  };

  // Initialize language from storage or city preference
  useEffect(() => {
    const initLanguage = async () => {
      try {
        setIsLoading(true);
        
        // Try to get language from storage
        const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        
        if (storedLanguage && Object.keys(SUPPORTED_LANGUAGES).includes(storedLanguage)) {
          await i18n.changeLanguage(storedLanguage as LanguageCode);
          setCurrentLanguage(storedLanguage as LanguageCode);
        } 
        // If no stored preference, use city's language if available
        else if (currentCity?.languageCode && Object.keys(SUPPORTED_LANGUAGES).includes(currentCity.languageCode)) {
          await i18n.changeLanguage(currentCity.languageCode as LanguageCode);
          setCurrentLanguage(currentCity.languageCode as LanguageCode);
        }
        // Otherwise use default
        else {
          await i18n.changeLanguage(defaultLanguage);
          setCurrentLanguage(defaultLanguage);
        }
      } catch (err) {
        console.error('Error initializing language:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    initLanguage();
  }, []);

  // Update language when city changes (if no user preference is stored)
  useEffect(() => {
    const updateLanguageFromCity = async () => {
      if (!currentCity) return;
      
      try {
        // Only change language based on city if user hasn't set a preference
        const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        
        if (!storedLanguage && 
            currentCity.languageCode && 
            Object.keys(SUPPORTED_LANGUAGES).includes(currentCity.languageCode)) {
          await i18n.changeLanguage(currentCity.languageCode as LanguageCode);
          setCurrentLanguage(currentCity.languageCode as LanguageCode);
        }
      } catch (err) {
        console.error('Error updating language from city:', err);
      }
    };
    
    updateLanguageFromCity();
  }, [currentCity]);

  // Context value
  const value: TranslationContextType = {
    currentLanguage,
    changeLanguage,
    t,
    isRTL,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isLoading,
    missingKeys,
    validateTranslationCompleteness,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

/**
 * Custom hook to use the translation context
 */
export const useAppTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  
  if (context === undefined) {
    throw new Error('useAppTranslation must be used within a TranslationProvider');
  }
  
  return context;
};

export default TranslationContext;
