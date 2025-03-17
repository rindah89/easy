import { supabase } from '../lib/supabase';
import { defaultNotificationSettings } from './notificationService';
import { defaultPrivacySettings } from './privacyService';

/**
 * Migrates settings for a specific user
 * @param userId The user's ID
 * @returns Success or error
 */
export async function migrateUserSettings(userId: string): Promise<{ success: boolean; error: any }> {
  try {
    // Create notification settings
    console.log(`Ensuring notification settings for user: ${userId}`);
    const dbNotificationSettings = {
      user_id: userId,
      push_enabled: defaultNotificationSettings.pushEnabled,
      email_enabled: defaultNotificationSettings.emailEnabled,
      new_messages: defaultNotificationSettings.newMessages,
      trade_updates: defaultNotificationSettings.tradeUpdates,
      new_matches: defaultNotificationSettings.newMatches,
      app_updates: defaultNotificationSettings.appUpdates,
      marketing_emails: defaultNotificationSettings.marketingEmails
    };
    
    const { error: notificationError } = await supabase
      .from('notification_settings')
      .upsert(dbNotificationSettings, {
        onConflict: 'user_id',
        ignoreDuplicates: true // Only insert if it doesn't exist
      });
      
    if (notificationError) {
      console.error('Error ensuring notification settings:', notificationError);
    }
    
    // Create privacy settings
    console.log(`Ensuring privacy settings for user: ${userId}`);
    const dbPrivacySettings = {
      user_id: userId,
      profile_visibility: defaultPrivacySettings.profileVisibility,
      show_online_status: defaultPrivacySettings.showOnlineStatus,
      show_last_seen: defaultPrivacySettings.showLastSeen,
      allow_location_sharing: defaultPrivacySettings.allowLocationSharing,
      allow_tagging: defaultPrivacySettings.allowTagging,
      data_collection: defaultPrivacySettings.dataCollection,
      personalization: defaultPrivacySettings.personalization
    };
    
    const { error: privacyError } = await supabase
      .from('privacy_settings')
      .upsert(dbPrivacySettings, {
        onConflict: 'user_id',
        ignoreDuplicates: true // Only insert if it doesn't exist
      });
      
    if (privacyError) {
      console.error('Error ensuring privacy settings:', privacyError);
      return { success: false, error: privacyError };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error migrating user settings:', error);
    return { success: false, error };
  }
}

/**
 * Ensures settings exist for the current user
 * This function can be called when the app starts to ensure settings exist
 * @param userId The current user's ID
 */
export async function ensureUserSettingsExist(userId: string): Promise<void> {
  if (!userId) return;
  
  try {
    await migrateUserSettings(userId);
  } catch (error) {
    console.error('Error ensuring user settings exist:', error);
  }
} 