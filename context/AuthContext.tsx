import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useRouter, useSegments } from 'expo-router';
import { Tables } from '../database.types';
import { uploadProfileAvatar } from '../services/imageservice';
import { createDefaultNotificationSettings } from '../services/notificationService';
import { createDefaultPrivacySettings } from '../services/privacyService';
import { ensureUserSettingsExist } from '../services/settingsMigrationService';

// Define the auth context type
type AuthContextType = {
  user: User | null;
  session: Session | null;
  initialized: boolean;
  userProfile: Tables<'user_profiles'> | null;
  isProfileComplete: boolean;
  signUp: (email: string, password: string, fullName: string, phoneNumber: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateUserProfile: (data: Partial<Tables<'user_profiles'>>) => Promise<{ error: any }>;
  uploadAvatar: (uri: string) => Promise<{ url: string | null; error: any }>;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [userProfile, setUserProfile] = useState<Tables<'user_profiles'> | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    console.log('Fetching user profile for ID:', userId);
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // Check if error is "no rows found"
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create a default one
          console.log('Profile not found, creating default profile');
          try {
            // Get user details from auth
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) {
              console.error('Cannot create profile: Auth user not found');
              return { data: null, error };
            }
            
            // Create basic profile
            const { data: newProfile, error: insertError } = await supabase
              .from('user_profiles')
              .insert({
                id: userId,
                email: userData.user.email || '',
                full_name: userData.user.user_metadata?.full_name || 'User',
                role: 'customer',
                verified: false,
                profile_completed: true, // Always mark as complete
              })
              .select('*')
              .single();
              
            if (insertError) {
              console.error('Failed to create default profile:', insertError);
              return { data: null, error: insertError };
            }
            
            console.log('Default profile created successfully');
            setUserProfile(newProfile);
            setIsProfileComplete(true); // Always mark as complete
            return { data: newProfile, error: null };
          } catch (createError) {
            console.error('Exception creating default profile:', createError);
            return { data: null, error: createError as any };
          }
        }
        
        return { data: null, error };
      }

      if (data) {
        console.log('Profile fetched successfully');
        setUserProfile(data);
        
        // Always consider profile complete regardless of phone number
        setIsProfileComplete(true);
        
        // If profile_completed field is not set to true, update it
        if (data.profile_completed !== true) {
          console.log('Updating profile_completed status');
          try {
            await supabase
              .from('user_profiles')
              .update({ profile_completed: true })
              .eq('id', userId);
          } catch (updateError) {
            console.error('Could not update profile_completed:', updateError);
          }
        }
      } else {
        console.log('No profile data returned for user:', userId);
      }

      return { data, error };
    } catch (unexpectedError) {
      console.error('Unexpected error fetching profile:', unexpectedError);
      return { data: null, error: unexpectedError as any };
    }
  };

  // Check if the user is authenticated and profile is complete
  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inRegistrationScreen = segments[1] === 'register';

    if (user) {
      // Allow access to registration page even when logged in
      if (inAuthGroup && !inRegistrationScreen) {
        // Redirect authenticated users from auth screens (except registration) to the main app
        router.replace('/(tabs)');
      } 
    } else if (!user && !inAuthGroup) {
      // Redirect unauthenticated users to the sign-in page
      router.replace('/(auth)/login');
    }
  }, [user, initialized, segments]);

  // Set up the auth state listener
  useEffect(() => {
    console.log('Setting up auth state listener');
    
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        console.log('User authenticated:', currentUser.id);
        try {
          // Fetch user profile when auth state changes
          const { data: profileData, error: profileError } = await fetchUserProfile(currentUser.id);
          
          if (profileError) {
            console.error('Failed to fetch profile during auth state change:', profileError);
          }
          
          // Ensure user settings exist
          try {
            await ensureUserSettingsExist(currentUser.id);
          } catch (settingsError) {
            console.error('Failed to ensure user settings exist:', settingsError);
          }
        } catch (err) {
          console.error('Error during profile setup after auth state change:', err);
        }
      } else {
        console.log('User signed out or no session');
        setUserProfile(null);
        setIsProfileComplete(false);
      }
      
      setInitialized(true);
    });

    // Initial session check
    console.log('Performing initial session check');
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', session ? 'Session found' : 'No session');
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        console.log('Initial user authenticated:', currentUser.id);
        try {
          // Fetch user profile on initial load
          const { error: profileError } = await fetchUserProfile(currentUser.id);
          
          if (profileError) {
            console.error('Failed to fetch profile during initial load:', profileError);
          }
          
          // Ensure user settings exist
          try {
            await ensureUserSettingsExist(currentUser.id);
          } catch (settingsError) {
            console.error('Failed to ensure user settings exist on initial load:', settingsError);
          }
        } catch (err) {
          console.error('Error during initial profile setup:', err);
        }
      } else {
        console.log('No user in initial session check');
      }
      
      setInitialized(true);
    }).catch(error => {
      console.error('Error during initial session check:', error);
      setInitialized(true); // Still mark as initialized to avoid hanging
    });

    return () => {
      console.log('Cleaning up auth state listener');
      data.subscription.unsubscribe();
    };
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string, fullName: string, phoneNumber: string) => {
    try {
      console.log('Starting signup process for:', email);
      
      // First, create the auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        console.error('Auth signup error:', signUpError);
        return { error: signUpError };
      }

      if (!authData.user) {
        console.error('Signup succeeded but no user returned');
        return { error: new Error('Account created but user data is missing') };
      }

      console.log('Auth signup successful, user ID:', authData.user.id);
      
      // Create user profile with phone number using service role (bypassing RLS)
      // This requires an admin API key to be set up in your Supabase project
      // We're directly creating the profile in the admin context to bypass RLS
      try {
        // Create user profile
        const { error: profileError } = await supabase.from('user_profiles').insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          phone_number: phoneNumber,
          role: 'customer', // Default role
          verified: false,
          profile_completed: true, // Mark profile as completed since we have phone number
        });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          
          // If there's an RLS error, let the user know they need to sign in
          if (profileError.code === '42501') {
            console.log('RLS policy blocked profile creation, notifying user to sign in');
            return { error: new Error('Account created successfully. Please sign in to complete your profile.') };
          }
          
          return { error: profileError };
        } else {
          console.log('Profile created successfully');
        }
      } catch (profileCreateError) {
        console.error('Exception creating profile:', profileCreateError);
        return { error: new Error('Account created but profile creation failed. Please sign in.') };
      }

      // Wait a moment to ensure profile record is committed to the database
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Initialize default notification settings
      try {
        await createDefaultNotificationSettings(authData.user.id);
      } catch (notifError) {
        console.error('Error creating notification settings:', notifError);
        // Continue despite notification settings error
      }
      
      // Initialize default privacy settings
      try {
        await createDefaultPrivacySettings(authData.user.id);
      } catch (privacyError) {
        console.error('Error creating privacy settings:', privacyError);
        // Continue despite privacy settings error
      }
      
      // Immediately fetch the newly created profile
      try {
        console.log('Fetching newly created profile');
        const { data: profileData, error: fetchError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
          
        if (fetchError) {
          console.error('Error fetching new profile:', fetchError);
        } else if (profileData) {
          console.log('Profile fetched successfully');
          setUserProfile(profileData);
          setIsProfileComplete(true); // Set to true since we have phone number
        }
      } catch (fetchError) {
        console.error('Exception fetching profile:', fetchError);
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      return { error };
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.EXPO_PUBLIC_APP_SCHEME}://reset-password`,
    });

    return { error };
  };

  // Update user profile function
  const updateUserProfile = async (data: Partial<Tables<'user_profiles'>>) => {
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(data)
      .eq('id', user.id);

    if (!error) {
      // Refresh user profile after update
      await fetchUserProfile(user.id);
    }

    return { error };
  };

  // Upload avatar function
  const uploadAvatar = async (uri: string) => {
    if (!user) {
      return { url: null, error: new Error('User not authenticated') };
    }

    try {
      // Use the uploadProfileAvatar function from imageservice
      const result = await uploadProfileAvatar(user.id, uri);
      
      if (!result.success) {
        return { url: null, error: result.error };
      }

      // Update user profile with avatar URL
      const avatarUrl = result.url;
      await updateUserProfile({ avatar_url: avatarUrl });

      return { url: avatarUrl, error: null };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return { url: null, error };
    }
  };

  const value = {
    user,
    session,
    initialized,
    userProfile,
    isProfileComplete,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateUserProfile,
    uploadAvatar,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 