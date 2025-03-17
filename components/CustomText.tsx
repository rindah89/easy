import React from 'react';
import { Text as RNText, StyleSheet, TextProps as RNTextProps, StyleProp, TextStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

export type TextVariant = 
  | 'regular' 
  | 'medium' 
  | 'bold' 
  | 'heavy' 
  | 'titleLarge' 
  | 'bodySmall'
  | 'bodyMedium'
  | 'bodyLarge'
  | 'labelSmall'
  | 'labelMedium'
  | 'labelLarge'
  | 'titleSmall'
  | 'titleMedium'
  | 'headlineSmall'
  | 'headlineMedium'
  | 'headlineLarge'
  | 'displaySmall'
  | 'displayMedium'
  | 'displayLarge';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  style?: StyleProp<TextStyle>;
  color?: string;
}

export function Text({ variant = 'regular', style, color, children, ...props }: TextProps) {
  const theme = useTheme();

  // Get font weight based on variant
  const getFontWeight = (variant: TextVariant) => {
    switch (variant) {
      case 'regular':
        return '400';
      case 'medium':
      case 'bodyMedium':
      case 'labelMedium':
      case 'titleMedium':
      case 'headlineMedium':
      case 'displayMedium':
        return '500';
      case 'bold':
      case 'titleLarge':
      case 'headlineLarge':
      case 'displayLarge':
        return '700';
      case 'heavy':
        return '900';
      case 'bodySmall':
      case 'labelSmall':
      case 'titleSmall':
      case 'headlineSmall':
      case 'displaySmall':
        return '400';
      case 'bodyLarge':
      case 'labelLarge':
        return '500';
      default:
        return '400';
    }
  };

  // Get font size based on variant
  const getFontSize = (variant: TextVariant) => {
    switch (variant) {
      case 'titleLarge':
        return 24;
      case 'titleMedium':
        return 20;
      case 'titleSmall':
        return 16;
      case 'bodyLarge':
        return 16;
      case 'bodyMedium':
        return 14;
      case 'bodySmall':
        return 12;
      case 'labelLarge':
        return 16;
      case 'labelMedium':
        return 14;
      case 'labelSmall':
        return 12;
      case 'headlineLarge':
        return 32;
      case 'headlineMedium':
        return 28;
      case 'headlineSmall':
        return 24;
      case 'displayLarge':
        return 48;
      case 'displayMedium':
        return 40;
      case 'displaySmall':
        return 36;
      case 'bold':
        return 18;
      case 'medium':
        return 16;
      case 'heavy':
        return 20;
      case 'regular':
      default:
        return 14;
    }
  };

  return (
    <RNText
      style={[
        {
          color: color || theme.colors.onSurface,
          fontWeight: getFontWeight(variant),
          fontSize: getFontSize(variant),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({}); 