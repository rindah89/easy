import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity,
  StatusBar,
  Switch
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '../components/CustomText';
import { Ionicons } from '@expo/vector-icons';
import { 
  NotificationSettings, 
  fetchNotificationSettings, 
  saveNotificationSettings 
} from '../services/notificationService';

export default function NotificationsSettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const insets = useSafeAreaInsets();
  
  // Notification settings state
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    emailEnabled: true,
    newMessages: true,
    tradeUpdates: true,
    newMatches: true,
    appUpdates: false,
    marketingEmails: false,
  });

  // Fetch notification settings from database
  useEffect(() => {
    async function loadNotificationSettings() {
      if (!user) return;
      
      setLoading(true);
      try {
        const { settings: userSettings, error } = await fetchNotificationSettings(user.id);
        
        if (error) throw error;
        
        setSettings(userSettings);
      } catch (error) {
        console.error('Error loading notification settings:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadNotificationSettings();
  }, [user]);

  // Toggle a setting
  const toggleSetting = (setting: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Save settings to database
  const saveSettings = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await saveNotificationSettings(user.id, settings);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving notification settings:', error);
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
          Notifications
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
            Notification Preferences
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: theme.colors.onSurfaceVariant,
              textAlign: 'center',
              marginBottom: 32,
            }}
          >
            Customize how and when you receive notifications
          </Text>

          {/* General Settings Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              General Settings
            </Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>
                  Push Notifications
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Receive notifications on your device
                </Text>
              </View>
              <Switch
                value={settings.pushEnabled}
                onValueChange={() => toggleSetting('pushEnabled')}
                trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryContainer }}
                thumbColor={settings.pushEnabled ? theme.colors.primary : theme.colors.outline}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>
                  Email Notifications
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Receive notifications via email
                </Text>
              </View>
              <Switch
                value={settings.emailEnabled}
                onValueChange={() => toggleSetting('emailEnabled')}
                trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryContainer }}
                thumbColor={settings.emailEnabled ? theme.colors.primary : theme.colors.outline}
              />
            </View>
          </View>

          {/* App Notifications Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              App Notifications
            </Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>
                  New Messages
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.onSurfaceVariant }]}>
                  When you receive a new message
                </Text>
              </View>
              <Switch
                value={settings.newMessages}
                onValueChange={() => toggleSetting('newMessages')}
                trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryContainer }}
                thumbColor={settings.newMessages ? theme.colors.primary : theme.colors.outline}
                disabled={!settings.pushEnabled}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>
                  Trade Updates
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.onSurfaceVariant }]}>
                  When there are updates to your trades
                </Text>
              </View>
              <Switch
                value={settings.tradeUpdates}
                onValueChange={() => toggleSetting('tradeUpdates')}
                trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryContainer }}
                thumbColor={settings.tradeUpdates ? theme.colors.primary : theme.colors.outline}
                disabled={!settings.pushEnabled}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>
                  New Matches
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.onSurfaceVariant }]}>
                  When you match with a new item
                </Text>
              </View>
              <Switch
                value={settings.newMatches}
                onValueChange={() => toggleSetting('newMatches')}
                trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryContainer }}
                thumbColor={settings.newMatches ? theme.colors.primary : theme.colors.outline}
                disabled={!settings.pushEnabled}
              />
            </View>
          </View>

          {/* Email Preferences Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Email Preferences
            </Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>
                  App Updates
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Receive emails about app updates and new features
                </Text>
              </View>
              <Switch
                value={settings.appUpdates}
                onValueChange={() => toggleSetting('appUpdates')}
                trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryContainer }}
                thumbColor={settings.appUpdates ? theme.colors.primary : theme.colors.outline}
                disabled={!settings.emailEnabled}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: theme.colors.onSurface }]}>
                  Marketing Emails
                </Text>
                <Text style={[styles.settingDescription, { color: theme.colors.onSurfaceVariant }]}>
                  Receive promotional emails and offers
                </Text>
              </View>
              <Switch
                value={settings.marketingEmails}
                onValueChange={() => toggleSetting('marketingEmails')}
                trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primaryContainer }}
                thumbColor={settings.marketingEmails ? theme.colors.primary : theme.colors.outline}
                disabled={!settings.emailEnabled}
              />
            </View>
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