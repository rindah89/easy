import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  TouchableOpacity,
  TextInput as RNTextInput,
  StatusBar
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text } from '../components/CustomText';
import { Ionicons } from '@expo/vector-icons';

// Form validation schema
const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone_number: z
    .string()
    .min(12, 'Phone number must be at least 12 digits including the country code')
    .regex(/^\+237[6-9][0-9]{7,8}$/, 'Please enter a valid Cameroonian phone number (e.g., +237612345678)'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function EditProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { userProfile, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      phone_number: '+2376',
    },
  });

  // Update form values when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setValue('full_name', userProfile.full_name || '');
      setValue('phone_number', userProfile.phone_number || '+2376');
    }
  }, [userProfile, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await updateUserProfile({
        full_name: data.full_name,
        phone_number: data.phone_number,
      });

      if (updateError) {
        throw updateError;
      }

      // Navigate back to profile screen
      router.back();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
          Edit Profile
        </Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
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
              Update Your Profile
            </Text>

            <Text
              style={{
                fontSize: 16,
                color: theme.colors.onSurfaceVariant,
                textAlign: 'center',
                marginBottom: 32,
              }}
            >
              Edit your personal information
            </Text>

            {/* Full Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <Controller
                control={control}
                name="full_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[
                    styles.customInput, 
                    !!errors.full_name && styles.inputError,
                    { borderColor: !!errors.full_name ? theme.colors.error : theme.colors.outline }
                  ]}>
                    <Ionicons name="person" size={20} color={theme.colors.onSurfaceVariant} style={styles.inputIcon} />
                    <RNTextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      style={[styles.textInput, { color: theme.colors.onSurface }]}
                      placeholder="Enter your full name"
                      placeholderTextColor={theme.colors.onSurfaceVariant}
                    />
                  </View>
                )}
              />
              {errors.full_name && (
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.error,
                    marginTop: 4,
                    marginLeft: 4,
                  }}
                >
                  {errors.full_name.message}
                </Text>
              )}
            </View>

            {/* Phone Number Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Cameroonian Phone Number</Text>
              <Controller
                control={control}
                name="phone_number"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[
                    styles.customInput, 
                    !!errors.phone_number && styles.inputError,
                    { borderColor: !!errors.phone_number ? theme.colors.error : theme.colors.outline }
                  ]}>
                    <Ionicons name="call" size={20} color={theme.colors.onSurfaceVariant} style={styles.inputIcon} />
                    <RNTextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      style={[styles.textInput, { color: theme.colors.onSurface }]}
                      placeholder="+237612345678"
                      placeholderTextColor={theme.colors.onSurfaceVariant}
                      keyboardType="phone-pad"
                    />
                  </View>
                )}
              />
              {errors.phone_number && (
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.error,
                    marginTop: 4,
                    marginLeft: 4,
                  }}
                >
                  {errors.phone_number.message}
                </Text>
              )}
            </View>

            <Text
              style={{
                fontSize: 12,
                color: theme.colors.onSurfaceVariant,
                marginTop: 4,
                marginBottom: 24,
                marginLeft: 4,
              }}
            >
              Enter your 8-digit number after the +2376 prefix
            </Text>

            {error && (
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.error,
                  textAlign: 'center',
                  marginTop: 16,
                  marginBottom: 16,
                }}
              >
                {error}
              </Text>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button, 
                  styles.cancelButton, 
                  { borderColor: theme.colors.outline }
                ]}
                onPress={() => router.back()}
                disabled={loading}
              >
                <Text style={{ color: theme.colors.primary }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.button, 
                  { backgroundColor: theme.colors.primary }
                ]}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
              >
                <Text style={{ color: theme.colors.onPrimary }}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 4,
  },
  customInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  inputError: {
    borderWidth: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
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