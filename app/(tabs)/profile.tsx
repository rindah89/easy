import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import LanguageButton from '../../components/LanguageButton';
import { Text } from '../../components/CustomText';
import { Divider } from '../../components/CustomDivider';
import { ListItem } from '../../components/CustomListItem';
import { Button } from '../../components/Button';
import { Modal } from '../../components/CustomModal';
import ProfileAvatar from '../../components/ProfileAvatar';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
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
        <Text variant="headlineMedium" color={theme.colors.primary}>
          {t('profile.title')}
        </Text>
        <LanguageButton style={styles.languageButton} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileSection}>
          <TouchableOpacity disabled={true}>
            {profile?.avatar_url ? (
              <Image 
                source={{ uri: profile.avatar_url }} 
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: theme.colors.primary }]}>
                <Text variant="headlineLarge" color="white">
                  {getInitials()}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <Text variant="titleLarge" style={styles.nameText}>
            {profile?.full_name || t('profile.noName')}
          </Text>
          <Text variant="bodyLarge" style={styles.emailText} color={theme.colors.onSurfaceVariant}>
            {user?.email}
          </Text>
        </View>

        <Divider />

        <View style={styles.listSection}>
          <ListItem
            title={t('profile.editProfile')}
            icon="account-edit"
            onPress={() => router.push('/edit-profile')}
          />
          <ListItem
            title={t('profile.changePassword')}
            icon="lock-reset"
            onPress={() => router.push('/change-password')}
          />
          <ListItem
            title={t('profile.notificationSettings')}
            icon="bell-outline"
            onPress={() => router.push('/notifications-settings')}
          />
          <ListItem
            title={t('profile.privacySettings')}
            icon="shield-account"
            onPress={() => router.push('/privacy-settings')}
          />
          <ListItem
            title={t('common.logout')}
            icon="logout"
            iconColor={theme.colors.error}
            titleStyle={{ color: theme.colors.error }}
            onPress={handleSignOut}
          />
        </View>
      </ScrollView>

      <Modal visible={showLogoutDialog} onDismiss={() => setShowLogoutDialog(false)}>
        <Modal.Title>{t('profile.logoutConfirmTitle')}</Modal.Title>
        <Modal.Content>
          <Text variant="bodyMedium">{t('profile.logoutConfirmMessage')}</Text>
        </Modal.Content>
        <Modal.Actions>
          <Button mode="text" onPress={() => setShowLogoutDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button mode="text" onPress={confirmSignOut} style={{ marginLeft: 8 }}>
            {t('common.logout')}
          </Button>
        </Modal.Actions>
      </Modal>
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
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  emailText: {
    marginTop: 5,
    opacity: 0.7,
  },
  listSection: {
    paddingTop: 8,
  },
}); 