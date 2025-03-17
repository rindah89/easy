import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform } from 'react-native';
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
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await resetPassword(data.email);
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Password reset instructions have been sent to your email.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
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
                fontWeight: 'bold'
              }
            ]}
          >
            Reset your password
          </Text>
          
          <Text 
            style={[
              styles.subtitle, 
              { 
                color: theme.colors.onSurfaceVariant,
                fontSize: 16
              }
            ]}
          >
            Enter your email address and we'll send you instructions to reset your password.
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
              name="email"
              label="Email"
              error={errors.email}
              keyboardType="email-address"
              icon="email"
              placeholder="your.email@example.com"
            />
            
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              disabled={loading}
              fullWidth
            >
              Send Reset Instructions
            </Button>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.footer}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              Remember your password?{' '}
            </Text>
            <Link href="/(auth)/login" style={{ color: theme.colors.primary }}>
              Sign in
            </Link>
          </View>
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
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
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
}); 