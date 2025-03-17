import React, { useState, useEffect } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, useTheme, Divider, Avatar } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, useRouter } from 'expo-router';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

// Function to ensure the profile_completed column exists
const ensureProfileCompletedColumnExists = async () => {
  if (__DEV__) { // Only run in development mode
    try {
      console.log('Ensuring profile_completed column exists...');
      
      // First, check if the execute_sql function exists
      const { data: functionExists, error: checkError } = await supabase
        .from('pg_proc')
        .select('proname')
        .eq('proname', 'execute_sql')
        .limit(1);
        
      if (checkError || !functionExists || functionExists.length === 0) {
        console.log('The execute_sql function does not exist. Using direct SQL query.');
        
        // Try a different approach - create a SQL migration in the console
        console.log('Note: Unable to automatically ensure the profile_completed column. Please check your database schema.');
        console.log('Consider running this SQL in your database:');
        console.log(`
          ALTER TABLE IF EXISTS "public"."user_profiles" 
          ADD COLUMN IF NOT EXISTS "profile_completed" BOOLEAN DEFAULT false;
          
          UPDATE "public"."user_profiles" 
          SET "profile_completed" = true 
          WHERE "phone_number" IS NOT NULL;
        `);
        return;
      }
      
      // This SQL will add the column if it doesn't exist
      const { error } = await supabase.rpc('execute_sql', {
        query: `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_schema = 'public' 
              AND table_name = 'user_profiles' 
              AND column_name = 'profile_completed'
            ) THEN
              ALTER TABLE "public"."user_profiles" ADD COLUMN "profile_completed" BOOLEAN DEFAULT false;
              UPDATE "public"."user_profiles" SET "profile_completed" = true WHERE "phone_number" IS NOT NULL;
            END IF;
          END
          $$;
        `
      });
      
      if (error) {
        console.error('Error ensuring profile_completed column:', error);
      } else {
        console.log('Profile_completed column check completed');
      }
    } catch (err) {
      console.error('Failed to ensure profile_completed column exists:', err);
    }
  }
};

// Form validation schema
const profileSchema = z.object({
  // Remove the phone_number field as it's now collected during registration
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function CompleteProfileScreen() {
  const theme = useTheme();
  const { user, userProfile, updateUserProfile, uploadAvatar, isProfileComplete } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const router = useRouter();

  // Run the column check on component mount
  useEffect(() => {
    ensureProfileCompletedColumnExists().catch(console.error);
  }, []);

  // Add effect to check and display current profile status
  useEffect(() => {
    if (userProfile) {
      // Handle the case where profile_completed might not exist in the database yet
      const isCompleted = userProfile.profile_completed === true;
      const hasPhoneNumber = !!userProfile.phone_number;
      
      const profileInfo = `User ID: ${userProfile.id?.substring(0, 8)}...
Profile status: ${isCompleted ? 'Completed' : 'Incomplete'}
Phone: ${userProfile.phone_number || 'Not set'}
Profile complete flag: ${userProfile.profile_completed === true ? 'True' : userProfile.profile_completed === false ? 'False' : 'Not set'}
Has phone number: ${hasPhoneNumber ? 'Yes' : 'No'}
Auth context profile complete: ${isProfileComplete ? 'Yes' : 'No'}`;
      
      setDebugInfo(profileInfo);
      
      // If profile has a phone number but isn't marked as completed,
      // update the profile_completed flag
      if (hasPhoneNumber && !isCompleted) {
        try {
          console.log('Auto-completing profile based on existing phone number');
          updateUserProfile({
            profile_completed: true
          });
        } catch (error) {
          console.error('Failed to update profile_completed status:', error);
        }
      }
    } else if (user) {
      setDebugInfo(`User authenticated but no profile data found. User ID: ${user.id?.substring(0, 8)}...`);
    } else {
      setDebugInfo('No user or profile data available.');
    }
  }, [userProfile, isProfileComplete, user]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      // Remove the phone_number field
    },
  });

  // Get the first letter of the user's name for the default avatar
  const getInitial = (): string => {
    if (userProfile?.full_name) {
      return userProfile.full_name.charAt(0).toUpperCase();
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.charAt(0).toUpperCase();
    }
    if (userProfile?.email) {
      return userProfile.email.charAt(0).toUpperCase();
    }
    return 'U'; // Default if no name or email is available
  };

  // Update form values if userProfile changes
  useEffect(() => {
    // Remove the phone number setting code
    if (userProfile?.avatar_url) {
      setAvatarUri(userProfile.avatar_url);
    }
  }, [userProfile, setValue]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Permission to access media library is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      setError('Failed to pick image. Please try again.');
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Upload avatar if selected
      let avatarUrl = userProfile?.avatar_url;
      
      if (avatarUri && avatarUri !== userProfile?.avatar_url) {
        setUploadingImage(true);
        const { url, error: uploadError } = await uploadAvatar(avatarUri);
        setUploadingImage(false);
        
        if (uploadError) {
          console.error('Avatar upload error:', uploadError);
          setError('Failed to upload profile picture. Please try again.');
          setLoading(false);
          return;
        }
        
        avatarUrl = url;
      }
      
      // Instead of just updating, use upsert by calling updateUserProfile with proper handling
      if (userProfile) {
        // Using updateUserProfile which already refreshes the profile after update
        const { error: updateError } = await updateUserProfile({
          avatar_url: avatarUrl,
          profile_completed: true,
        });
        
        if (updateError) {
          console.error('Profile update error:', updateError);
          setError('Failed to update profile. Please try again.');
        } else {
          // Success notification
          setError(null);
          // After successful update, we will be redirected by the AuthContext
        }
      } else {
        // If for some reason userProfile doesn't exist, use direct upsert via supabase
        // This should rarely happen but provides extra resilience
        if (!user) {
          setError('User authentication required.');
          setLoading(false);
          return;
        }
        
        const { error: upsertError } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            avatar_url: avatarUrl,
            profile_completed: true,
            // Include minimum required fields in case this is a new insert
            email: user.email || '',
            full_name: user.user_metadata?.full_name || 'User',
            role: 'customer',
          }, 
          { 
            onConflict: 'id',
            ignoreDuplicates: false,
          });
        
        if (upsertError) {
          console.error('Profile upsert error:', upsertError);
          setError('Failed to save profile. Please try again.');
        } else {
          // Refresh profile data to trigger AuthContext checks
          await updateUserProfile({ profile_completed: true });
        }
      }
    } catch (err) {
      console.error('Profile completion error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.onBackground,
                fontSize: 24,
                fontWeight: 'bold',
              },
            ]}
          >
            Complete Your Profile
          </Text>

          {/* Add debug info display */}
          {__DEV__ && debugInfo && (
            <Text style={[styles.debugInfo, { color: theme.colors.primary }]}>
              {debugInfo}
            </Text>
          )}
          
          <Text
            style={[
              styles.subtitle,
              {
                color: theme.colors.onSurfaceVariant,
                fontSize: 16,
              },
            ]}
          >
            Please add a profile photo to personalize your account
          </Text>

          <View style={styles.avatarContainer}>
            {avatarUri ? (
              <TouchableOpacity onPress={pickImage}>
                <Image
                  source={{ uri: avatarUri }}
                  style={[styles.avatar, { borderColor: theme.colors.outline }]}
                />
                <View style={[styles.editBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                  <MaterialCommunityIcons
                    name="pencil"
                    size={14}
                    color={theme.colors.onPrimaryContainer}
                  />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={pickImage}
                style={[
                  styles.avatarPlaceholder,
                  { 
                    backgroundColor: theme.colors.primaryContainer,
                    borderColor: theme.colors.outline
                  },
                ]}
              >
                {uploadingImage ? (
                  <ActivityIndicator color={theme.colors.primary} size="small" />
                ) : (
                  <>
                    <View style={[styles.initialBadge, { backgroundColor: theme.colors.primary }]}>
                      <Text style={[styles.initialText, { color: theme.colors.onPrimary }]}>
                        {getInitial()}
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name="camera-plus"
                      size={24}
                      color={theme.colors.onPrimaryContainer}
                      style={styles.cameraIcon}
                    />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          <Divider style={styles.divider} />

          {error && (
            <Text
              style={[
                styles.errorText,
                { color: theme.colors.error },
              ]}
            >
              {error}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={loading || uploadingImage}
            style={styles.button}
            fullWidth
          >
            Complete Profile
          </Button>
          
          {/* Force skip button for development and troubleshooting */}
          {__DEV__ && (
            <>
              <View style={styles.dividerContainer}>
                <Divider style={styles.divider} />
                <Text style={[styles.dividerText, { color: theme.colors.onSurfaceVariant }]}>For troubleshooting</Text>
                <Divider style={styles.divider} />
              </View>
              
              <Button
                mode="outlined"
                onPress={async () => {
                  setLoading(true);
                  try {
                    if (user) {
                      // Force update the profile as complete regardless of other fields
                      const { error: updateError } = await supabase
                        .from('user_profiles')
                        .upsert({
                          id: user.id,
                          profile_completed: true,
                          // Set a default phone number if none exists
                          phone_number: userProfile?.phone_number || '+237600000000',
                          // Include minimum required fields in case this is a new insert
                          email: user.email || '',
                          full_name: user.user_metadata?.full_name || 'User',
                          role: 'customer',
                        }, { onConflict: 'id' });
                        
                      if (updateError) {
                        console.error('Force skip update error:', updateError);
                        setError('Failed to force skip due to database update error.');
                        return;
                      }
                      
                      // Force refresh the userProfile in the AuthContext
                      await updateUserProfile({ profile_completed: true });
                      
                      // Explicitly navigate to the tabs route
                      router.replace('/(tabs)');
                    } else {
                      setError('User not authenticated. Cannot skip profile completion.');
                    }
                  } catch (err) {
                    console.error('Force skip error:', err);
                    setError('Failed to force skip. Please try again.');
                  } finally {
                    setLoading(false);
                  }
                }}
                style={[styles.button, { marginTop: 8 }]}
                fullWidth
              >
                Force Skip (Dev Only)
              </Button>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'visible',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  divider: {
    marginBottom: 24,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
  },
  debugInfo: {
    marginTop: 16,
    textAlign: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
  },
  dividerText: {
    marginHorizontal: 8,
    fontSize: 12,
  },
  editBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 2,
    borderRadius: 12,
  },
  initialBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 2,
    borderRadius: 12,
  },
  initialText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cameraIcon: {
    marginTop: 4,
  },
}); 