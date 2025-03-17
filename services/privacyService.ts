import { supabase } from '../lib/supabase';

// Define privacy settings type
export type PrivacySettings = {
  profileVisibility: 'public' | 'friends' | 'private';
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  allowLocationSharing: boolean;
  allowTagging: boolean;
  dataCollection: boolean;
  personalization: boolean;
};

// Default privacy settings
export const defaultPrivacySettings: PrivacySettings = {
  profileVisibility: 'public',
  showOnlineStatus: true,
  showLastSeen: true,
  allowLocationSharing: false,
  allowTagging: true,
  dataCollection: true,
  personalization: true,
};

/**
 * Fetch privacy settings for a user
 * @param userId The user's ID
 * @returns The user's privacy settings or default settings if none exist
 */
export async function fetchPrivacySettings(userId: string): Promise<{ 
  settings: PrivacySettings; 
  error: any 
}> {
  try {
    const { data, error } = await supabase
      .from('privacy_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) throw error;
    
    if (data) {
      // If settings exist, return them
      return {
        settings: {
          profileVisibility: data.profile_visibility || 'public',
          showOnlineStatus: data.show_online_status ?? true,
          showLastSeen: data.show_last_seen ?? true,
          allowLocationSharing: data.allow_location_sharing ?? false,
          allowTagging: data.allow_tagging ?? true,
          dataCollection: data.data_collection ?? true,
          personalization: data.personalization ?? true,
        },
        error: null
      };
    } else {
      // If no settings exist, create default settings
      await createDefaultPrivacySettings(userId);
      return { settings: defaultPrivacySettings, error: null };
    }
  } catch (error) {
    console.error('Error fetching privacy settings:', error);
    return { settings: defaultPrivacySettings, error };
  }
}

/**
 * Create default privacy settings for a user
 * @param userId The user's ID
 * @returns Success or error
 */
export async function createDefaultPrivacySettings(userId: string): Promise<{ error: any }> {
  try {
    const defaultSettings = {
      user_id: userId,
      profile_visibility: defaultPrivacySettings.profileVisibility,
      show_online_status: defaultPrivacySettings.showOnlineStatus,
      show_last_seen: defaultPrivacySettings.showLastSeen,
      allow_location_sharing: defaultPrivacySettings.allowLocationSharing,
      allow_tagging: defaultPrivacySettings.allowTagging,
      data_collection: defaultPrivacySettings.dataCollection,
      personalization: defaultPrivacySettings.personalization
    };
    
    const { error } = await supabase
      .from('privacy_settings')
      .insert(defaultSettings);
      
    return { error };
  } catch (error) {
    console.error('Error creating default privacy settings:', error);
    return { error };
  }
}

/**
 * Save privacy settings for a user
 * @param userId The user's ID
 * @param settings The privacy settings to save
 * @returns Success or error
 */
export async function savePrivacySettings(
  userId: string, 
  settings: PrivacySettings
): Promise<{ error: any }> {
  try {
    // Convert settings to database format
    const dbSettings = {
      user_id: userId,
      profile_visibility: settings.profileVisibility,
      show_online_status: settings.showOnlineStatus,
      show_last_seen: settings.showLastSeen,
      allow_location_sharing: settings.allowLocationSharing,
      allow_tagging: settings.allowTagging,
      data_collection: settings.dataCollection,
      personalization: settings.personalization
    };
    
    // Upsert settings (insert if not exists, update if exists)
    const { error } = await supabase
      .from('privacy_settings')
      .upsert(dbSettings, { 
        onConflict: 'user_id',
        ignoreDuplicates: false
      });
      
    return { error };
  } catch (error) {
    console.error('Error saving privacy settings:', error);
    return { error };
  }
} 