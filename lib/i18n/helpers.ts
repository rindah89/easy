import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Hook to provide translation function and current language
 * Use this hook in your components to easily access translation capabilities
 * 
 * @returns An object with the translation function, current language, and language change function
 */
export const useAppTranslation = () => {
  const { t, i18n } = useTranslation();
  const { language, changeLanguage, isRTL, availableLanguages } = useLanguage();

  return {
    t,        // Translation function
    i18n,     // i18n instance
    language, // Current language code
    changeLanguage, // Function to change the language
    isRTL,    // Is the current language RTL
    availableLanguages, // Available languages list
  };
};

/**
 * Helper function to format dates according to the current language
 * 
 * @param date The date to format
 * @param options Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
  const { language } = useLanguage();
  
  // Default options for date formatting
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Intl.DateTimeFormat(language, defaultOptions).format(date);
};

/**
 * Helper function to format numbers according to the current language
 * 
 * @param number The number to format
 * @param options Intl.NumberFormatOptions
 * @returns Formatted number string
 */
export const formatNumber = (number: number, options?: Intl.NumberFormatOptions): string => {
  const { language } = useLanguage();
  
  // Default options for number formatting
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'decimal',
    ...options
  };
  
  return new Intl.NumberFormat(language, defaultOptions).format(number);
};

/**
 * Helper function to format currencies according to the current language
 * 
 * @param amount The amount to format
 * @param currencyCode The ISO currency code (e.g. 'USD', 'EUR')
 * @param options Intl.NumberFormatOptions
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number, 
  currencyCode: string = 'USD', 
  options?: Intl.NumberFormatOptions
): string => {
  const { language } = useLanguage();
  
  // Default options for currency formatting
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  };
  
  return new Intl.NumberFormat(language, defaultOptions).format(amount);
}; 