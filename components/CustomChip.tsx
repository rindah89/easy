import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle, StyleProp } from 'react-native';
import { Text } from './CustomText';
import { useTheme } from 'react-native-paper';

interface ChipProps {
  children: React.ReactNode;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  selectedColor?: string;
  disabled?: boolean;
}

export function Chip({
  children,
  selected = false,
  onPress,
  style,
  selectedColor,
  disabled = false,
}: ChipProps) {
  const theme = useTheme();
  const chipColor = selected ? selectedColor || theme.colors.primary : theme.colors.surfaceVariant;
  const textColor = selected ? theme.colors.onPrimary : theme.colors.onSurface;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.container,
        {
          backgroundColor: chipColor,
          borderColor: selected ? chipColor : theme.colors.outline,
        },
        style,
      ]}
      activeOpacity={0.7}
    >
      <Text
        variant="bodySmall"
        style={[
          styles.label,
          { color: textColor },
        ]}
        numberOfLines={1}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    marginRight: 10,
    height: 36,
  },
  label: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
}); 