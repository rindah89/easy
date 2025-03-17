import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}

export function SearchBar({ 
  value, 
  onChangeText, 
  placeholder,
  style
}: SearchBarProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <View 
      style={[
        styles.searchBarContainer, 
        isFocused && { borderWidth: 2, borderColor: theme.colors.primary },
        style
      ]}
    >
      <Ionicons 
        name="search" 
        size={20} 
        color={isFocused ? theme.colors.primary : theme.colors.outline} 
        style={styles.searchIcon} 
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || "Search..."}
        style={styles.searchInput}
        placeholderTextColor={theme.colors.outline}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {value ? (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Ionicons name="close-circle" size={20} color={theme.colors.outline} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
}); 