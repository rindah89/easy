import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, setI18nConfig } from '../lib/i18n';
import * as Localization from 'expo-localization';

// Define the shape of our context
interface LanguageContextType {
  language: string;
  changeLanguage: (language: string) => Promise<void>;
  isRTL: boolean;
  availableLanguages: typeof LANGUAGES;
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Storage key for persisting language preference
const LANGUAGE_STORAGE_KEY = 'user_language_preference';

// Language Provider Component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState<string>(i18n.language || 'en');
  const [isRTL, setIsRTL] = useState<boolean>(false);

  // Load saved language preference on mount
  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLanguage) {
          changeLanguage(savedLanguage);
        } else {
          // Use device language or fallback to English
          const deviceLanguage = Localization.locale.slice(0, 2);
          const supportedLanguage = Object.keys(LANGUAGES).includes(deviceLanguage) 
            ? deviceLanguage 
            : 'en';
          changeLanguage(supportedLanguage);
        }
      } catch (error) {
        console.error('Failed to load language preference:', error);
      }
    };

    loadSavedLanguage();
  }, []);

  // Function to change the app language
  const changeLanguage = async (lang: string) => {
    try {
      if (!Object.keys(LANGUAGES).includes(lang)) {
        console.warn(`Language ${lang} is not supported, falling back to English`);
        lang = 'en';
      }

      // Update i18n configuration
      setI18nConfig(lang);
      
      // Update RTL state based on the selected language
      const selectedLanguage = LANGUAGES[lang as keyof typeof LANGUAGES];
      setIsRTL(selectedLanguage?.isRTL || false);
      
      // Update state
      setLanguage(lang);
      
      // Save to AsyncStorage for persistence
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Context value
  const contextValue: LanguageContextType = {
    language,
    changeLanguage,
    isRTL,
    availableLanguages: LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext; 