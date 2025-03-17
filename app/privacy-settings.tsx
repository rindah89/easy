import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '../components/CustomText';
import { Ionicons } from '@expo/vector-icons';
import { 
  PrivacySettings, 
  fetchPrivacySettings, 
  savePrivacySettings 
} from '../services/privacyService';

export default function PrivacySettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const insets = useSafeAreaInsets();
  
  // Privacy settings state
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showOnlineStatus: true,
    showLastSeen: true,
    allowLocationSharing: false,
    allowTagging: true,
    dataCollection: true,
    personalization: true,
  });

  // Fetch privacy settings from database
  useEffect(() => {
    async function loadPrivacySettings() {
      if (!user) return;
      
      setLoading(true);
      try {
        const { settings: userSettings, error } = await fetchPrivacySettings(user.id);
        
        if (error) throw error;
        
        setSettings(userSettings);
      } catch (error) {
        console.error('Error loading privacy settings:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadPrivacySettings();
  }, [user]);

  // Toggle a boolean setting
  const toggleSetting = (setting: keyof Omit<PrivacySettings, 'profileVisibility'>) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Change profile visibility
  const changeProfileVisibility = (visibility: 'public' | 'friends' | 'private') => {
    setSettings(prev => ({
      ...prev,
      profileVisibility: visibility
    }));
  };

  // Save settings to database
  const saveSettings = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await savePrivacySettings(user.id, settings);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving privacy settings:', error);
    } finally {
      setSaving(false);
    }
  };

  // Save settings when they change
  useEffect(() => {
    // Don't save on initial load
    if (loading) return;
    
    // Debounce save to avoid too many requests
    const timer = setTimeout(() => {
      saveSettings();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [settings]);

  // Delete account handler
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ],
      { cancelable: true }
    );
  };

  // Confirm delete account
  const confirmDeleteAccount = () => {
    Alert.alert(
      'Confirm Deletion',
      'Please type "DELETE" to confirm account deletion.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Proceed',
          style: 'destructive',
          // In a real app, you would implement actual account deletion here
          onPress: () => {
            Alert.alert(
              'Account Deletion Request Submitted',
              'Your account deletion request has been submitted. Our team will process it within 30 days.',
              [{ text: 'OK' }]
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar backgroundColor={theme.colors.surface} barStyle="dark-content" />
      
      {/* Custom Header with safe area padding */}
      <View 
        style={[
          styles.header, 
          { 
            backgroundColor: theme.colors.surface,
            paddingTop: insets.top,
            paddingLeft: insets.left,
            paddingRight: insets.right
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          Privacy Settings
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingLeft: Math.max(16, insets.left),
            paddingRight: Math.max(16, insets.right),
            paddingBottom: Math.max(16, insets.bottom)
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: theme.colors.onBackground,
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            Privacy Preferences
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: theme.colors.onSurfaceVariant,
              textAlign: 'center',
              marginBottom: 32,
            }}
          >
            Control your privacy and data sharing preferences
          </Text>

          {/* Profile Visibility Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Profile Visibility
            </Text>
            
            <TouchableOpacity 
              style={[
                styles.visibilityOption,
                settings.profileVisibility === 'public' && styles.selectedOption,
                { borderColor: settings.profileVisibility === 'public' ? theme.colors.primary : theme.colors.outline }
              ]}
              onPress={() => changeProfileVisibility('public')}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons 
                  name="globe-outline" 
                  size={24} 
                  color={settings.profileVisibility === 'public' ? theme.colors.primary : theme.colors.onSurfaceVariant} 
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[
                  styles.optionTitle, 
                  { color: settings.profileVisibility === 'public' ? theme.colors.primary : theme.colors.onSurface }
                ]}>
                  Public
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Anyone can see your profile and items
                </Text>
              </View>
              {settings.profileVisibility === 'public' && (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.visibilityOption,
                settings.profileVisibility === 'friends' && styles.selectedOption,
                { borderColor: settings.profileVisibility === 'friends' ? theme.colors.primary : theme.colors.outline }
              ]}
              onPress={() => changeProfileVisibility('friends')}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons 
                  name="people-outline" 
                  size={24} 
                  color={settings.profileVisibility === 'friends' ? theme.colors.primary : theme.colors.onSurfaceVariant} 
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[
                  styles.optionTitle, 
                  { color: settings.profileVisibility === 'friends' ? theme.colors.primary : theme.colors.onSurface }
                ]}>
                  Friends Only
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Only people you've traded with can see your profile
                </Text>
              </View>
              {settings.profileVisibility === 'friends' && (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.visibilityOption,
                settings.profileVisibility === 'private' && styles.selectedOption,
                { borderColor: settings.profileVisibility === 'private' ? theme.colors.primary : theme.colors.outline }
              ]}
              onPress={() => changeProfileVisibility('private')}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={24} 
                  color={settings.profileVisibility === 'private' ? theme.colors.primary : theme.colors.onSurfaceVariant} 
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[
                  styles.optionTitle, 
                  { color: settings.profileVisibility === 'private' ? theme.colors.primary : theme.colors.onSurface }
                ]}>
                  Private
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Only you can see your profile details
                </Text>
              </View>
              {settings.profileVisibility === 'private' && (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Activity Status Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Activity Status
            </Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>
                  Show Online Status
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Let others see when you're online
                </Text>
              </View>
              <Switch
                value={settings.showOnlineStatus}
                onValueChange={() => toggleSetting('showOnlineStatus')}
                trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryContainer }}
                thumbColor={settings.showOnlineStatus ? theme.colors.primary : theme.colors.outline}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>
                  Show Last Seen
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Let others see when you were last active
                </Text>
              </View>
              <Switch
                value={settings.showLastSeen}
                onValueChange={() => toggleSetting('showLastSeen')}
                trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryContainer }}
                thumbColor={settings.showLastSeen ? theme.colors.primary : theme.colors.outline}
              />
            </View>
          </View>

          {/* Location & Tagging Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Location & Tagging
            </Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>
                  Location Sharing
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Allow approximate location to be shared with trade partners
                </Text>
              </View>
              <Switch
                value={settings.allowLocationSharing}
                onValueChange={() => toggleSetting('allowLocationSharing')}
                trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryContainer }}
                thumbColor={settings.allowLocationSharing ? theme.colors.primary : theme.colors.outline}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>
                  Allow Tagging
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Allow others to tag you in posts and photos
                </Text>
              </View>
              <Switch
                value={settings.allowTagging}
                onValueChange={() => toggleSetting('allowTagging')}
                trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryContainer }}
                thumbColor={settings.allowTagging ? theme.colors.primary : theme.colors.outline}
              />
            </View>
          </View>

          {/* Data & Personalization Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Data & Personalization
            </Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>
                  Data Collection
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Allow us to collect usage data to improve the app
                </Text>
              </View>
              <Switch
                value={settings.dataCollection}
                onValueChange={() => toggleSetting('dataCollection')}
                trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryContainer }}
                thumbColor={settings.dataCollection ? theme.colors.primary : theme.colors.outline}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>
                  Personalization
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Allow us to personalize your experience based on your activity
                </Text>
              </View>
              <Switch
                value={settings.personalization}
                onValueChange={() => toggleSetting('personalization')}
                trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryContainer }}
                thumbColor={settings.personalization ? theme.colors.primary : theme.colors.outline}
              />
            </View>
          </View>

          {/* Account Actions Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Account Actions
            </Text>
            
            <TouchableOpacity 
              style={[styles.actionButton, { borderColor: theme.colors.outline }]}
              onPress={() => {
                Alert.alert(
                  'Download Your Data',
                  'We will prepare your data for download and notify you when it\'s ready.',
                  [{ text: 'OK' }]
                );
              }}
            >
              <Ionicons name="download-outline" size={24} color={theme.colors.primary} style={styles.actionIcon} />
              <Text style={[styles.actionText, { color: theme.colors.onSurface }]}>
                Download Your Data
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { borderColor: theme.colors.error }]}
              onPress={handleDeleteAccount}
            >
              <Ionicons name="trash-outline" size={24} color={theme.colors.error} style={styles.actionIcon} />
              <Text style={[styles.actionText, { color: theme.colors.error }]}>
                Delete Your Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Save indicator */}
          <Text
            style={{
              fontSize: 12,
              color: theme.colors.onSurfaceVariant,
              textAlign: 'center',
              marginTop: 24,
              fontStyle: 'italic',
            }}
          >
            {saving ? 'Saving changes...' : 'Changes are saved automatically'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedOption: {
    borderWidth: 2,
  },
  optionIconContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionIcon: {
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 40, // To center the title accounting for the back button
  },
  rightPlaceholder: {
    width: 40,
    height: 24,
  },
}); 