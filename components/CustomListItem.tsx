import React from 'react';
import { StyleSheet, View, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Text } from './CustomText';
import { IconButton } from './CustomIconButton';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ListItemProps {
  title: string;
  description?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  titleStyle?: any;
  right?: () => React.ReactNode;
}

export function ListItem({
  title,
  description,
  icon,
  iconColor,
  onPress,
  style,
  titleStyle,
  right
}: ListItemProps) {
  const theme = useTheme();

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name={icon} 
            size={24} 
            color={iconColor || theme.colors.primary} 
          />
        </View>
      )}
      
      <View style={styles.contentContainer}>
        <Text 
          variant="bodyLarge" 
          style={[{ color: theme.colors.onSurface }, titleStyle]}
        >
          {title}
        </Text>
        
        {description && (
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {description}
          </Text>
        )}
      </View>
      
      {right && (
        <View style={styles.rightContainer}>
          {right()}
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  rightContainer: {
    marginLeft: 8,
  },
}); 