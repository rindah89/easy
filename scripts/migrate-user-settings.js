/**
 * Migration script to set up default notification and privacy settings for existing users
 * 
 * Run this script with: node scripts/migrate-user-settings.js
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with hardcoded values for testing
// IMPORTANT: Replace these with your actual Supabase URL and anon key
const supabaseUrl = 'https://your-supabase-project-url.supabase.co';
const supabaseKey = 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Default notification settings
const defaultNotificationSettings = {
  push_enabled: true,
  email_enabled: true,
  new_messages: true,
  trade_updates: true,
  new_matches: true,
  app_updates: false,
  marketing_emails: false
};

// Default privacy settings
const defaultPrivacySettings = {
  profile_visibility: 'public',
  show_online_status: true,
  show_last_seen: true,
  allow_location_sharing: false,
  allow_tagging: true,
  data_collection: true,
  personalization: true
};

async function migrateUserSettings() {
  try {
    console.log('Starting migration of user settings...');
    
    // Get all users from user_profiles
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id');
      
    if (usersError) {
      throw usersError;
    }
    
    console.log(`Found ${users.length} users to migrate`);
    
    // Process each user
    for (const user of users) {
      const userId = user.id;
      console.log(`Processing user: ${userId}`);
      
      // Check if notification settings exist
      const { data: notificationData } = await supabase
        .from('notification_settings')
        .select('id')
        .eq('user_id', userId)
        .single();
        
      if (!notificationData) {
        console.log(`Creating notification settings for user: ${userId}`);
        const { error: notificationError } = await supabase
          .from('notification_settings')
          .insert({
            user_id: userId,
            ...defaultNotificationSettings
          });
          
        if (notificationError) {
          console.error(`Error creating notification settings for user ${userId}:`, notificationError);
        }
      } else {
        console.log(`Notification settings already exist for user: ${userId}`);
      }
      
      // Check if privacy settings exist
      const { data: privacyData } = await supabase
        .from('privacy_settings')
        .select('id')
        .eq('user_id', userId)
        .single();
        
      if (!privacyData) {
        console.log(`Creating privacy settings for user: ${userId}`);
        const { error: privacyError } = await supabase
          .from('privacy_settings')
          .insert({
            user_id: userId,
            ...defaultPrivacySettings
          });
          
        if (privacyError) {
          console.error(`Error creating privacy settings for user ${userId}:`, privacyError);
        }
      } else {
        console.log(`Privacy settings already exist for user: ${userId}`);
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run the migration
migrateUserSettings(); 