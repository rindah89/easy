import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Text } from './CustomText';

interface BadgeProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textColor?: string;
  visible?: boolean;
}

export function Badge({
  children,
  style,
  textColor,
  visible = true,
}: BadgeProps) {
  const theme = useTheme();
  
  if (!visible) {
    return null;
  }
  
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: theme.colors.error },
        style,
      ]}
    >
      <Text
        variant="bodySmall"
        style={[
          styles.text,
          { color: textColor || theme.colors.onError },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
}); 