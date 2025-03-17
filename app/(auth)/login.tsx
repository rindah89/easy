import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, useTheme, Divider } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { FormInput } from '../../components/FormInput';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signIn, user, isProfileComplete } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add an effect to check if user is authenticated and redirect if necessary
  useEffect(() => {
    if (user) {
      setLoading(false);
      if (isProfileComplete) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/complete-profile');
      }
    }
  }, [user, isProfileComplete, router]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Attempting login for:', data.email);
      
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        console.error('Login error:', error);
        
        // Provide more user-friendly error messages
        let errorMessage = error.message;
        if (error.message.includes('Invalid login')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Too many login attempts. Please try again later.';
        }
        
        setError(errorMessage);
        setLoading(false); // Reset loading state on error
        return;
      }
      
      console.log('Login successful, waiting for auth context redirect');
      // Don't reset loading here - the useEffect will handle redirection
      // when the user state updates
    } catch (err: any) {
      console.error('Unexpected login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false); // Reset loading state on exception
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
              Sign in to your account
            </Text>
            
            {error && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
            )}
            
            <View style={styles.form}>
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
                name="password"
                label="Password"
                error={errors.password}
                secureTextEntry
                icon="lock"
                placeholder="Your password"
              />
              
              <Link href="/(auth)/forgot-password" style={[styles.forgotPassword, { color: theme.colors.primary }]}>
                Forgot password?
              </Link>
              
              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                disabled={loading}
                fullWidth
              >
                Sign In
              </Button>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.footer}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                Don't have an account?{' '}
              </Text>
              <Link href="/(auth)/register" style={{ color: theme.colors.primary }}>
                Sign up
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
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: 8,
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
}); 