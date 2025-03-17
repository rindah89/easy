import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, useTheme, Avatar, Divider, List, Portal, Dialog, Button as PaperButton } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { Tables } from '../../database.types';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import LanguageButton from '../../components/LanguageButton';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, signOut, uploadAvatar, updateUserProfile } = useAuth();
  const [profile, setProfile] = useState<Tables<'user_profiles'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  // Get first letter of name for avatar fallback
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        console.error('Permission to access media library is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await updateProfileAvatar(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error picking image:', err);
    }
  };

  const updateProfileAvatar = async (uri: string) => {
    if (!uri) return;

    setUploadingImage(true);
    try {
      const { url, error } = await uploadAvatar(uri);
      
      if (error) {
        console.error('Error uploading avatar:', error);
        
        // Check if the error is related to storage bucket permissions
        if (error.toString().includes('bucket') || 
            error.toString().includes('storage') || 
            error.toString().includes('row-level security')) {
          showStoragePermissionError();
        } else {
          Alert.alert(
            "Upload Error",
            "Failed to upload profile picture. Please try again later.",
            [{ text: "OK" }]
          );
        }
      } else if (url) {
        // Avatar URL is already updated in the profile by the uploadAvatar function
        // Refresh the profile data
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user?.id || '')
          .single();
          
        if (data) {
          setProfile(data);
        }
      }
    } catch (err) {
      console.error('Error updating avatar:', err);
      Alert.alert(
        "Error",
        "An unexpected error occurred while updating your profile picture.",
        [{ text: "OK" }]
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const showStoragePermissionError = () => {
    Alert.alert(
      "Storage Permission Error",
      "There's an issue with the storage permissions in your Supabase project. Please contact the administrator to fix the storage bucket permissions.",
      [{ text: "OK" }]
    );
  };

  const navigateToEditProfile = () => {
    // Navigate to edit profile screen
    router.push('/edit-profile');
  };

  const handleSignOut = () => {
    setShowLogoutDialog(true);
  };

  const confirmSignOut = async () => {
    setShowLogoutDialog(false);
    await signOut();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
          {t('profile.title')}
        </Text>
        <LanguageButton style={styles.languageButton} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickImage} disabled={uploadingImage}>
            {profile?.avatar_url ? (
              <Avatar.Image 
                size={100} 
                source={{ uri: profile.avatar_url }} 
                style={styles.avatar} 
              />
            ) : (
              <Avatar.Text 
                size={100} 
                label={getInitials()} 
                style={styles.avatar} 
              />
            )}
            {uploadingImage ? (
              <Text style={styles.uploadingText}>{t('profile.uploading')}</Text>
            ) : (
              <Text style={styles.changePhotoText}>{t('profile.changePhoto')}</Text>
            )}
          </TouchableOpacity>

          <Text variant="titleLarge" style={styles.nameText}>
            {profile?.full_name || t('profile.noName')}
          </Text>
          <Text variant="bodyLarge" style={styles.emailText}>
            {user?.email}
          </Text>
        </View>

        <Divider />

        <List.Section>
          <List.Item
            title={t('profile.editProfile')}
            left={props => <List.Icon {...props} icon="account-edit" />}
            onPress={navigateToEditProfile}
          />
          <List.Item
            title={t('profile.changePassword')}
            left={props => <List.Icon {...props} icon="lock-reset" />}
            onPress={() => router.push('/change-password')}
          />
          <List.Item
            title={t('profile.notificationSettings')}
            left={props => <List.Icon {...props} icon="bell-outline" />}
            onPress={() => router.push('/notifications-settings')}
          />
          <List.Item
            title={t('profile.privacySettings')}
            left={props => <List.Icon {...props} icon="shield-account" />}
            onPress={() => router.push('/privacy-settings')}
          />
          <List.Item
            title={t('common.logout')}
            left={props => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
            onPress={handleSignOut}
            titleStyle={{ color: theme.colors.error }}
          />
        </List.Section>
      </ScrollView>

      <Portal>
        <Dialog visible={showLogoutDialog} onDismiss={() => setShowLogoutDialog(false)}>
          <Dialog.Title>{t('profile.logoutConfirmTitle')}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{t('profile.logoutConfirmMessage')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <PaperButton onPress={() => setShowLogoutDialog(false)}>{t('common.cancel')}</PaperButton>
            <PaperButton onPress={confirmSignOut}>{t('common.logout')}</PaperButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  languageButton: {
    marginLeft: 'auto',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    marginBottom: 16,
  },
  nameText: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emailText: {
    color: theme.colors.onSurfaceVariant,
  },
  uploadingText: {
    color: theme.colors.onSurfaceVariant,
  },
  changePhotoText: {
    color: theme.colors.onSurfaceVariant,
  },
  divider: {
    marginVertical: 16,
  },
}); 