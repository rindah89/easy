# Internationalization (i18n) Guide for EasyD

This guide explains how to implement and use internationalization in the EasyD app to support multiple languages.

## Table of Contents

1. [Setup Overview](#setup-overview)
2. [Directory Structure](#directory-structure)
3. [How to Use Translations in Components](#how-to-use-translations-in-components)
4. [Adding a New Language](#adding-a-new-language)
5. [Adding New Translation Keys](#adding-new-translation-keys)
6. [Formatting Functions](#formatting-functions)

## Setup Overview

The app uses:
- `i18next` and `react-i18next` for internationalization
- `expo-localization` for detecting the device language
- `AsyncStorage` for saving language preferences

The LanguageProvider wraps the entire app in `_layout.tsx` to provide translation functionality everywhere.

## Directory Structure

```
lib/
  └── i18n/
      ├── index.ts              # Main i18n configuration
      ├── helpers.ts            # Helper functions for i18n
      └── locales/              # Translation files
          ├── en.json           # English translations
          └── fr.json           # French translations
context/
  └── LanguageContext.tsx       # Language context for state management
components/
  ├── LanguageButton.tsx        # Button to trigger language selector
  └── LanguageSelector.tsx      # Modal for selecting a language
```

## How to Use Translations in Components

### Basic Usage

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <View>
      <Text>{t('common.welcome')}</Text>
      <Button title={t('common.save')} />
    </View>
  );
}
```

### Using the Enhanced Hook

We provide a custom hook `useAppTranslation` that gives you access to translation functions and language-related utilities:

```jsx
import { useAppTranslation } from '../lib/i18n/helpers';

function MyComponent() {
  const { t, language, isRTL } = useAppTranslation();
  
  return (
    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
      <Text>{t('common.welcome')}</Text>
      <Text>Current language: {language}</Text>
    </View>
  );
}
```

### Adding the Language Selector

To allow users to change the language, add the `LanguageButton` component:

```jsx
import LanguageButton from '../components/LanguageButton';

function MyScreen() {
  return (
    <View>
      <LanguageButton />
      {/* Rest of your screen */}
    </View>
  );
}
```

## Adding a New Language

1. Create a new JSON file in `lib/i18n/locales/` (e.g., `es.json` for Spanish)
2. Copy the structure from an existing language file and translate the strings
3. Update the `LANGUAGES` object in `lib/i18n/index.ts`:

```typescript
export const LANGUAGES = {
  en: { label: 'English', value: 'en', isRTL: false },
  fr: { label: 'Français', value: 'fr', isRTL: false },
  es: { label: 'Español', value: 'es', isRTL: false }, // Add the new language
};
```

4. Update the resources in the `i18next.init` configuration:

```typescript
i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    es: { translation: es }, // Add the new language
  },
  // ...
});
```

## Adding New Translation Keys

1. Add new keys to all language files (`en.json`, `fr.json`, etc.)
2. Use a nested structure to organize translations by feature or section
3. Example:

```json
{
  "chat": {
    "newMessage": "New Message",
    "send": "Send"
  }
}
```

## Formatting Functions

We provide helper functions for formatting dates, numbers, and currencies according to the user's language:

```jsx
import { formatDate, formatNumber, formatCurrency } from '../lib/i18n/helpers';

function PriceDisplay() {
  return (
    <View>
      <Text>Date: {formatDate(new Date())}</Text>
      <Text>Items: {formatNumber(1250)}</Text>
      <Text>Price: {formatCurrency(99.99, 'USD')}</Text>
    </View>
  );
}
```

These functions will automatically format according to the conventions of the selected language. 