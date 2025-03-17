import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, useTheme, Divider } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

// Form validation schema
const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number').startsWith('+', 'Phone number must start with country code (e.g. +237)'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const theme = useTheme();
  const { signUp, signOut, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [existingUserDetected, setExistingUserDetected] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      console.log('Existing user detected in registration page:', user.id);
      setExistingUserDetected(true);
    } else {
      setExistingUserDetected(false);
    }
  }, [user]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '+237',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      setExistingUserDetected(false);
      console.log('Signed out successfully to enable new registration');
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Starting registration process for:', data.email);
      
      // Sign up with Supabase
      const { error: signUpError } = await signUp(data.email, data.password, data.fullName, data.phoneNumber);

      if (signUpError) {
        console.error('Registration error:', signUpError);
        throw signUpError;
      }

      console.log('Registration successful');
      setSuccess('Account created successfully! Redirecting to the app...');
      
      // Add a delay before the user is redirected by the AuthContext
      setTimeout(() => {
        // The AuthContext will handle the redirect automatically
        console.log('Registration process complete, waiting for redirect');
      }, 2000);
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Attempt to give a more user-friendly error message
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (err.message) {
        if (err.message.includes('email') && err.message.includes('taken')) {
          errorMessage = 'This email address is already in use. Please try a different email or sign in.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setLoading(false); // Ensure loading is set to false on error
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text 
              style={[
                styles.title, 
                { 
                  color: theme.colors.onBackground,
                  fontSize: 24,
                  fontWeight: 'bold'
                }
              ]}
            >
              Create Account
            </Text>
            
            {existingUserDetected && (
              <View style={styles.existingUserWarning}>
                <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginBottom: 16 }}>
                  You are already signed in with another account. To create a new account, you need to sign out first.
                </Text>
                <Button
                  mode="outlined"
                  onPress={handleSignOut}
                  loading={loading}
                  disabled={loading}
                  fullWidth
                >
                  Sign Out to Create New Account
                </Button>
              </View>
            )}

            {!existingUserDetected && (
              <>
                <Text 
                  style={[
                    styles.subtitle, 
                    { 
                      color: theme.colors.onSurfaceVariant,
                      fontSize: 16
                    }
                  ]}
                >
                  Sign up to get started with easyRide.
                </Text>
                
                {error && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    {error}
                  </Text>
                )}
                
                {success && (
                  <Text style={[styles.successText, { color: theme.colors.primary }]}>
                    {success}
                  </Text>
                )}
                
                <View style={styles.form}>
                  <FormInput
                    control={control}
                    name="fullName"
                    label="Full Name"
                    error={errors.fullName}
                    icon="account"
                    placeholder="John Doe"
                  />
                  
                  <FormInput
                    control={control}
                    name="email"
                    label="Email"
                    error={errors.email}
                    keyboardType="email-address"
                    icon="email"
                    placeholder="your.email@example.com"
                  />
                  
                  <FormInput
                    control={control}
                    name="phoneNumber"
                    label="Phone Number"
                    error={errors.phoneNumber}
                    keyboardType="phone-pad"
                    icon="phone"
                    placeholder="+237612345678"
                  />
                  
                  <FormInput
                    control={control}
                    name="password"
                    label="Password"
                    error={errors.password}
                    secureTextEntry
                    icon="lock"
                    placeholder="Your password"
                  />
                  
                  <FormInput
                    control={control}
                    name="confirmPassword"
                    label="Confirm Password"
                    error={errors.confirmPassword}
                    secureTextEntry
                    icon="lock-check"
                    placeholder="Confirm your password"
                  />
                  
                  <Button
                    mode="contained"
                    onPress={handleSubmit(onSubmit)}
                    loading={loading}
                    disabled={loading}
                    fullWidth
                  >
                    Create Account
                  </Button>
                </View>
              </>
            )}
            
            <Divider style={styles.divider} />
            
            <View style={styles.footer}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                Already have an account?{' '}
              </Text>
              <Link href="/(auth)/login" style={{ color: theme.colors.primary }}>
                Sign in
              </Link>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  divider: {
    marginVertical: 32,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  successText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  existingUserWarning: {
    marginBottom: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
}); 