import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';

// Import language resources
import en from './locales/en.json';
import fr from './locales/fr.json';

// Define available languages
export const LANGUAGES = {
  en: { label: 'English', value: 'en', isRTL: false },
  fr: { label: 'Français', value: 'fr', isRTL: false },
};

// Get device language (fallback to 'en' if not supported)
const getDeviceLanguage = (): string => {
  // Get the device's locale code (e.g., 'en-US', 'fr-FR')
  const locale = Localization.locale;
  
  // Extract the language code (first two characters)
  const languageCode = locale.slice(0, 2);
  
  // Check if the device language is supported by our app
  return Object.keys(LANGUAGES).includes(languageCode) ? languageCode : 'en';
};

// Configure i18next
i18next.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// Handle RTL languages
export const setI18nConfig = (language: string) => {
  // Update the i18n instance language
  i18next.changeLanguage(language);
  
  // Handle RTL languages if needed
  const selectedLanguage = LANGUAGES[language as keyof typeof LANGUAGES];
  if (selectedLanguage && selectedLanguage.isRTL !== undefined) {
    I18nManager.forceRTL(selectedLanguage.isRTL);
  }
};

export default i18next; 