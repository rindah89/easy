import { supabase } from '../lib/supabase';

// Define notification settings type
export type NotificationSettings = {
  pushEnabled: boolean;
  emailEnabled: boolean;
  newMessages: boolean;
  tradeUpdates: boolean;
  newMatches: boolean;
  appUpdates: boolean;
  marketingEmails: boolean;
};

// Default notification settings
export const defaultNotificationSettings: NotificationSettings = {
  pushEnabled: true,
  emailEnabled: true,
  newMessages: true,
  tradeUpdates: true,
  newMatches: true,
  appUpdates: false,
  marketingEmails: false,
};

/**
 * Fetch notification settings for a user
 * @param userId The user's ID
 * @returns The user's notification settings or default settings if none exist
 */
export async function fetchNotificationSettings(userId: string): Promise<{ 
  settings: NotificationSettings; 
  error: any 
}> {
  try {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) throw error;
    
    if (data) {
      // If settings exist, return them
      return {
        settings: {
          pushEnabled: data.push_enabled ?? true,
          emailEnabled: data.email_enabled ?? true,
          newMessages: data.new_messages ?? true,
          tradeUpdates: data.trade_updates ?? true,
          newMatches: data.new_matches ?? true,
          appUpdates: data.app_updates ?? false,
          marketingEmails: data.marketing_emails ?? false,
        },
        error: null
      };
    } else {
      // If no settings exist, create default settings
      await createDefaultNotificationSettings(userId);
      return { settings: defaultNotificationSettings, error: null };
    }
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return { settings: defaultNotificationSettings, error };
  }
}

/**
 * Create default notification settings for a user
 * @param userId The user's ID
 * @returns Success or error
 */
export async function createDefaultNotificationSettings(userId: string): Promise<{ error: any }> {
  try {
    const defaultSettings = {
      user_id: userId,
      push_enabled: defaultNotificationSettings.pushEnabled,
      email_enabled: defaultNotificationSettings.emailEnabled,
      new_messages: defaultNotificationSettings.newMessages,
      trade_updates: defaultNotificationSettings.tradeUpdates,
      new_matches: defaultNotificationSettings.newMatches,
      app_updates: defaultNotificationSettings.appUpdates,
      marketing_emails: defaultNotificationSettings.marketingEmails
    };
    
    const { error } = await supabase
      .from('notification_settings')
      .insert(defaultSettings);
      
    return { error };
  } catch (error) {
    console.error('Error creating default notification settings:', error);
    return { error };
  }
}

/**
 * Save notification settings for a user
 * @param userId The user's ID
 * @param settings The notification settings to save
 * @returns Success or error
 */
export async function saveNotificationSettings(
  userId: string, 
  settings: NotificationSettings
): Promise<{ error: any }> {
  try {
    // Convert settings to database format
    const dbSettings = {
      user_id: userId,
      push_enabled: settings.pushEnabled,
      email_enabled: settings.emailEnabled,
      new_messages: settings.newMessages,
      trade_updates: settings.tradeUpdates,
      new_matches: settings.newMatches,
      app_updates: settings.appUpdates,
      marketing_emails: settings.marketingEmails
    };
    
    // Upsert settings (insert if not exists, update if exists)
    const { error } = await supabase
      .from('notification_settings')
      .upsert(dbSettings, { 
        onConflict: 'user_id',
        ignoreDuplicates: false
      });
      
    return { error };
  } catch (error) {
    console.error('Error saving notification settings:', error);
    return { error };
  }
} 