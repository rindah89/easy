import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  TouchableOpacity,
  TextInput as RNTextInput,
  StatusBar,
  Alert
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
import { supabase } from '../lib/supabase';

// Form validation schema
const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(8, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ChangePasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: PasswordFormData) => {
    if (!user) {
      setError('You must be logged in to change your password');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // First verify the current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: data.currentPassword,
      });

      if (signInError) {
        setError('Current password is incorrect');
        setLoading(false);
        return;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      // Success
      setSuccess('Password updated successfully');
      reset();
      
      // Show success alert
      Alert.alert(
        'Success',
        'Your password has been updated successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
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
          Change Password
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
              Update Your Password
            </Text>

            <Text
              style={{
                fontSize: 16,
                color: theme.colors.onSurfaceVariant,
                textAlign: 'center',
                marginBottom: 32,
              }}
            >
              Please enter your current password and a new secure password
            </Text>

            {/* Current Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <Controller
                control={control}
                name="currentPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[
                    styles.customInput, 
                    !!errors.currentPassword && styles.inputError,
                    { borderColor: !!errors.currentPassword ? theme.colors.error : theme.colors.outline }
                  ]}>
                    <Ionicons name="lock-closed" size={20} color={theme.colors.onSurfaceVariant} style={styles.inputIcon} />
                    <RNTextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      style={[styles.textInput, { color: theme.colors.onSurface }]}
                      placeholder="Enter your current password"
                      placeholderTextColor={theme.colors.onSurfaceVariant}
                      secureTextEntry
                    />
                  </View>
                )}
              />
              {errors.currentPassword && (
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.error,
                    marginTop: 4,
                    marginLeft: 4,
                  }}
                >
                  {errors.currentPassword.message}
                </Text>
              )}
            </View>

            {/* New Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <Controller
                control={control}
                name="newPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[
                    styles.customInput, 
                    !!errors.newPassword && styles.inputError,
                    { borderColor: !!errors.newPassword ? theme.colors.error : theme.colors.outline }
                  ]}>
                    <Ionicons name="lock-open" size={20} color={theme.colors.onSurfaceVariant} style={styles.inputIcon} />
                    <RNTextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      style={[styles.textInput, { color: theme.colors.onSurface }]}
                      placeholder="Enter your new password"
                      placeholderTextColor={theme.colors.onSurfaceVariant}
                      secureTextEntry
                    />
                  </View>
                )}
              />
              {errors.newPassword && (
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.error,
                    marginTop: 4,
                    marginLeft: 4,
                  }}
                >
                  {errors.newPassword.message}
                </Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={[
                    styles.customInput, 
                    !!errors.confirmPassword && styles.inputError,
                    { borderColor: !!errors.confirmPassword ? theme.colors.error : theme.colors.outline }
                  ]}>
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.onSurfaceVariant} style={styles.inputIcon} />
                    <RNTextInput
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      style={[styles.textInput, { color: theme.colors.onSurface }]}
                      placeholder="Confirm your new password"
                      placeholderTextColor={theme.colors.onSurfaceVariant}
                      secureTextEntry
                    />
                  </View>
                )}
              />
              {errors.confirmPassword && (
                <Text
                  style={{
                    fontSize: 12,
                    color: theme.colors.error,
                    marginTop: 4,
                    marginLeft: 4,
                  }}
                >
                  {errors.confirmPassword.message}
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
              Password must be at least 8 characters with uppercase, lowercase, number, and special character
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

            {success && (
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.primary,
                  textAlign: 'center',
                  marginTop: 16,
                  marginBottom: 16,
                }}
              >
                {success}
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
                  {loading ? 'Updating...' : 'Update Password'}
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