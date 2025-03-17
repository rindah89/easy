import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ProfileAvatar from './ProfileAvatar';
import { Text } from './CustomText';

interface CustomHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showAvatar?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
}

/**
 * A reusable header component that includes optional back button and profile avatar
 */
const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  showAvatar = true,
  onBackPress,
  rightComponent,
}) => {
  const theme = useTheme();
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.outlineVariant 
        }
      ]}
    >
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
          >
            <MaterialCommunityIcons 
              name="arrow-left" 
              size={24} 
              color={theme.colors.onSurface} 
            />
          </TouchableOpacity>
        )}
        <View>
          <Text 
            variant="bold" 
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text 
              variant="regular" 
              style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        {rightComponent}
        {showAvatar && <ProfileAvatar size={36} style={styles.avatar} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontSize: 18,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
  },
  avatar: {
    marginLeft: 12,
  },
});

export default CustomHeader; 