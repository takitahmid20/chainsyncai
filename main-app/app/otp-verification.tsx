/**
 * Email Verification Screen
 * Handles verification token from email link
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { BorderRadius, Spacing } from '@/constants/Spacing';

export default function EmailVerificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string; email?: string }>();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auto-verify if token is provided in URL
    if (params.token) {
      handleAutoVerify();
    }
  }, [params.token]);

  /**
   * Auto-verify when token is in URL
   */
  const handleAutoVerify = async () => {
    if (!params.token) return;
    
    setVerifying(true);
    try {
      await authService.verifyEmail({ token: params.token });
      setVerified(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed. The link may be invalid or expired.');
      setVerified(false);
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <View style={styles.container}>
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={Colors.primary.main} />
              <Text style={styles.verifyingText}>Verifying your email...</Text>
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (verified) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <View style={styles.container}>
            <LinearGradient
              colors={['#10b981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons name="checkmark-circle" size={64} color="#10b981" />
                </View>
              </View>
            </LinearGradient>

            <View style={styles.content}>
              <Text style={styles.title}>Email Verified!</Text>
              <Text style={styles.message}>
                Your email has been successfully verified. You can now sign in to your account.
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.replace('/signin')}
              >
                <Text style={styles.primaryButtonText}>Go to Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (error) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
          <View style={styles.container}>
            <LinearGradient
              colors={['#ef4444', '#dc2626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons name="close-circle" size={64} color="#ef4444" />
                </View>
              </View>
            </LinearGradient>

            <View style={styles.content}>
              <Text style={styles.title}>Verification Failed</Text>
              <Text style={styles.errorMessage}>{error}</Text>

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => router.replace('/signup')}
                >
                  <Text style={styles.primaryButtonText}>Sign Up Again</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => router.replace('/signin')}
                >
                  <Text style={styles.secondaryButtonText}>Go to Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="mail-outline" size={48} color="#6366f1" />
              </View>
            </View>
          </LinearGradient>

          <View style={styles.content}>
            <Text style={styles.title}>Check Your Email</Text>
            <Text style={styles.message}>
              We sent a verification link to{'\n'}
              <Text style={styles.email}>{params.email || 'your email'}</Text>
            </Text>
            <Text style={styles.instructions}>
              Please check your inbox (and spam folder) and click the verification link to activate your account.
            </Text>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.replace('/signin')}
            >
              <Text style={styles.secondaryButtonText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.paper,
  },
  
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: Spacing['2xl'],
    alignItems: 'center',
  },
  
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  
  iconCircle: {
    width: 100,
    height: 100,
    backgroundColor: Colors.background.paper,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  content: {
    flex: 1,
    padding: Spacing['2xl'],
  },
  
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  verifyingText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.neutral[600],
    marginTop: Spacing.lg,
  },
  
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  
  message: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[600],
    marginBottom: Spacing.xl,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  email: {
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary.main,
  },
  
  instructions: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[500],
    marginBottom: Spacing['2xl'],
    textAlign: 'center',
    lineHeight: 20,
  },
  
  errorMessage: {
    fontSize: Typography.fontSize.base,
    color: Colors.error.main,
    marginBottom: Spacing['2xl'],
    textAlign: 'center',
    lineHeight: 24,
  },
  
  buttonGroup: {
    gap: Spacing.md,
  },
  
  primaryButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  
  primaryButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.white,
  },
  
  secondaryButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  
  secondaryButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary.main,
  },
});
