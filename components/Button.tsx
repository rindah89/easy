import React from 'react';
import { TouchableOpacity, StyleSheet, Text, ActivityIndicator, View, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TextVariant } from './CustomText';

type ButtonVariant = TextVariant;

interface ButtonProps {
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  fullWidth?: boolean;
  variant?: ButtonVariant;
}

export function Button({
  mode = 'contained',
  onPress,
  style,
  textStyle,
  loading = false,
  disabled = false,
  children,
  icon,
  fullWidth = false,
  variant = 'regular',
}: ButtonProps) {
  const theme = useTheme();

  // Determine background and text colors based on mode
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.surfaceDisabled;
    
    switch (mode) {
      case 'contained':
      case 'contained-tonal':
      case 'elevated':
        return theme.colors.primary;
      case 'outlined':
      case 'text':
      default:
        return 'transparent';
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.onSurfaceDisabled;
    
    switch (mode) {
      case 'contained':
      case 'contained-tonal':
      case 'elevated':
        return theme.colors.onPrimary;
      case 'outlined':
      case 'text':
      default:
        return theme.colors.primary;
    }
  };

  const getBorderColor = () => {
    if (disabled) return theme.colors.surfaceDisabled;
    
    switch (mode) {
      case 'outlined':
        return theme.colors.primary;
      default:
        return 'transparent';
    }
  };

  // Get font weight based on variant
  const getFontWeight = () => {
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
  const getFontSize = () => {
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
        return 16; // Default button text size
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor(), borderColor: getBorderColor() },
        mode === 'outlined' && styles.outlined,
        mode === 'elevated' && styles.elevated,
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={getTextColor()} style={styles.icon} />
        ) : icon ? (
          <MaterialCommunityIcons name={icon} size={20} color={getTextColor()} style={styles.icon} />
        ) : null}
        
        <Text 
          style={[
            styles.text, 
            { 
              color: getTextColor(),
              fontWeight: getFontWeight(),
              fontSize: getFontSize()
            }, 
            textStyle
          ]}
        >
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
    borderWidth: 0,
    minHeight: 48,
    justifyContent: 'center',
  },
  outlined: {
    borderWidth: 1,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  icon: {
    marginRight: 8,
  },
}); 