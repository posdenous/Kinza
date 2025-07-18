/**
 * Translation Utilities
 * 
 * Helper functions for working with translations in the Kinza app
 * Supports the language completeness rule by providing utilities for translation management
 */

import { useTranslation } from 'react-i18next';
import { i18n } from './i18n';
import { Platform } from 'react-native';

/**
 * Format a date according to the current locale
 */
export const formatDate = (date: Date, options: Intl.DateTimeFormatOptions = {}): string => {
  const { i18n } = useTranslation();
  
  return new Intl.DateTimeFormat(i18n.language, options).format(date);
};

/**
 * Format a number according to the current locale
 */
export const formatNumber = (number: number, options: Intl.NumberFormatOptions = {}): string => {
  const { i18n } = useTranslation();
  
  return new Intl.NumberFormat(i18n.language, options).format(number);
};

/**
 * Format a currency value according to the current locale
 */
export const formatCurrency = (amount: number, currencyCode: string = 'EUR'): string => {
  const { i18n } = useTranslation();
  
  return new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

/**
 * Get the appropriate plural form based on count
 */
export const getPlural = (count: number, key: string): string => {
  const { t } = useTranslation();
  
  return t(key, { count });
};

/**
 * Check if a translation key exists in the current language
 */
export const hasTranslation = (key: string): boolean => {
  return i18n.exists(key);
};

/**
 * Get all missing translation keys for a specific language
 */
export const getMissingTranslationKeys = (language: string): string[] => {
  const allKeys = new Set<string>();
  const missingKeys: string[] = [];
  
  // Collect all keys from all namespaces
  Object.keys(i18n.services.resourceStore.data).forEach(lang => {
    Object.keys(i18n.services.resourceStore.data[lang]).forEach(namespace => {
      const resources = i18n.services.resourceStore.data[lang][namespace];
      collectKeys(resources, '', allKeys);
    });
  });
  
  // Check if all keys exist in the specified language
  allKeys.forEach(key => {
    const hasTranslation = i18n.exists(key, { lng: language });
    if (!hasTranslation) {
      missingKeys.push(key);
    }
  });
  
  return missingKeys;
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

/**
 * Get the appropriate RTL text alignment based on the current language
 */
export const getTextAlignment = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  
  return {
    textAlign: isRTL ? 'right' : 'left',
    writingDirection: isRTL ? 'rtl' : 'ltr',
  };
};

/**
 * Get the appropriate layout direction based on the current language
 */
export const getLayoutDirection = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  
  return {
    flexDirection: isRTL ? 'row-reverse' : 'row',
  };
};

/**
 * Helper function to extract translatable text from components
 * Used during the refactoring process to identify text that needs translation
 */
export const extractTranslatableText = (component: any): string[] => {
  // This is a development utility function
  if (process.env.NODE_ENV !== 'development') {
    return [];
  }
  
  const extractedTexts: string[] = [];
  
  // Simple regex to find potential translatable text in component files
  // This is a basic implementation and might need refinement
  const textRegex = /<Text[^>]*>([^<]+)<\/Text>/g;
  const stringRegex = /['"]([^'"]+)['"]/g;
  
  const componentString = component.toString();
  
  // Extract text from Text components
  let match;
  while ((match = textRegex.exec(componentString)) !== null) {
    if (match[1] && match[1].trim()) {
      extractedTexts.push(match[1].trim());
    }
  }
  
  // Extract potential string literals
  while ((match = stringRegex.exec(componentString)) !== null) {
    if (match[1] && match[1].trim() && match[1].length > 3) {
      // Filter out short strings and common non-translatable patterns
      if (!match[1].startsWith('#') && // Not a color
          !match[1].match(/^[0-9.]+$/) && // Not a number
          !match[1].match(/^https?:\/\//) && // Not a URL
          !match[1].match(/^[a-zA-Z0-9_]+$/) && // Not a variable name
          match[1].match(/\s/) // Contains whitespace (likely a sentence)
      ) {
        extractedTexts.push(match[1].trim());
      }
    }
  }
  
  return [...new Set(extractedTexts)]; // Remove duplicates
};

/**
 * Generate a translation key from text
 * Useful when refactoring components to use translations
 */
export const generateTranslationKey = (text: string, context: string = ''): string => {
  // Convert text to snake_case
  const baseKey = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 30); // Limit length
  
  // Add context prefix if provided
  return context ? `${context}.${baseKey}` : baseKey;
};

/**
 * Check if the device language is supported
 */
export const isLanguageSupported = (languageCode: string): boolean => {
  // Get language code without region (e.g. 'en-US' -> 'en')
  const baseLanguageCode = languageCode.split('-')[0];
  
  return Object.keys(i18n.options.resources || {}).includes(baseLanguageCode);
};

/**
 * Get the device language
 */
export const getDeviceLanguage = (): string => {
  if (Platform.OS === 'web') {
    return (
      (navigator.languages && navigator.languages[0]) || 
      navigator.language || 
      'en'
    );
  }
  
  // For React Native, we would use the Localization API
  // This is a simplified implementation
  return 'en';
};

export default {
  formatDate,
  formatNumber,
  formatCurrency,
  getPlural,
  hasTranslation,
  getMissingTranslationKeys,
  getTextAlignment,
  getLayoutDirection,
  extractTranslatableText,
  generateTranslationKey,
  isLanguageSupported,
  getDeviceLanguage,
};
