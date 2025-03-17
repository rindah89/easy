import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

interface IconButtonProps {
  icon: any; // Using any for icon names to avoid TypeScript errors
  size?: number;
  color?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function IconButton({
  icon,
  size = 24,
  color,
  onPress,
  style,
  disabled = false,
}: IconButtonProps) {
  const theme = useTheme();
  const iconColor = color || theme.colors.onSurface;
  
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons
        name={icon}
        size={size}
        color={disabled ? theme.colors.onSurfaceDisabled : iconColor}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 