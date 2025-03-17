import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from 'react-native-paper';

interface DividerProps {
  style?: StyleProp<ViewStyle>;
}

export function Divider({ style }: DividerProps) {
  const theme = useTheme();
  
  return (
    <View
      style={[
        styles.divider,
        { backgroundColor: theme.colors.outlineVariant },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
  },
}); 