import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

interface ProfileAvatarProps {
  size?: number;
  style?: object;
}

/**
 * A reusable profile avatar component that navigates to the profile page when clicked
 */
const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ size = 40, style }) => {
  const router = useRouter();
  const { user, userProfile } = useAuth();

  // Navigate to profile screen
  const navigateToProfile = () => {
    router.push('/profile');
  };

  // Get first letter of name or email for avatar fallback
  const getInitial = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <TouchableOpacity
      onPress={navigateToProfile}
      activeOpacity={0.7}
      style={[styles.container, style]}
    >
      {userProfile?.avatar_url ? (
        <Avatar.Image
          size={size}
          source={{ uri: userProfile.avatar_url }}
        />
      ) : (
        <Avatar.Text
          size={size}
          label={getInitial()}
          color="white"
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    // Add any container styles here if needed
  },
});

export default ProfileAvatar; 