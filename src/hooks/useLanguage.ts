import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loadLanguage, saveLanguage } from '../utils/i18n';

/**
 * Hook to manage language settings
 * @returns Language state and functions
 */
export const useLanguage = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [isLoading, setIsLoading] = useState(true);

  // Available languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' }
  ];

  // Load saved language on mount
  useEffect(() => {
    const initLanguage = async () => {
      setIsLoading(true);
      const savedLanguage = await loadLanguage();
      setCurrentLanguage(savedLanguage);
      setIsLoading(false);
    };

    initLanguage();
  }, []);

  // Change language
  const changeLanguage = async (languageCode: string) => {
    if (languages.some(lang => lang.code === languageCode)) {
      await saveLanguage(languageCode);
      setCurrentLanguage(languageCode);
      return true;
    }
    return false;
  };

  return {
    currentLanguage,
    languages,
    changeLanguage,
    isLoading
  };
};

export default useLanguage;
