import React from 'react';
import { Provider as PaperProvider, MD3DarkTheme, MD3LightTheme, adaptNavigationTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';

// Adapt navigation theme to work with Paper
const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

// Custom light theme
const CombinedLightTheme = {
  ...MD3LightTheme,
  ...LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...LightTheme.colors,
    primary: '#E9272B',
    secondary: '#5E5CE6',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    error: '#FF3B30',
  },
};

// Custom dark theme
const CombinedDarkTheme = {
  ...MD3DarkTheme,
  ...DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...DarkTheme.colors,
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    background: '#1C1C1E',
    surface: '#2C2C2E',
    error: '#FF453A',
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? CombinedDarkTheme : CombinedLightTheme;

  return <PaperProvider theme={theme}>{children}</PaperProvider>;
} 