/**
 * Email Verification Sent Screen
 * Shows confirmation after successful signup
 * User needs to click the verification link in their email
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { BorderRadius, Spacing } from '@/constants/Spacing';

export default function EmailVerificationSentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string; message?: string }>();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <View style={styles.container}>
          {/* Header with Gradient */}
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

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Check Your Email</Text>
            
            <Text style={styles.message}>
              We've sent a verification link to
            </Text>
            
            <Text style={styles.email}>{params.email}</Text>
            
            <View style={styles.instructionsContainer}>
              <View style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.instructionText}>
                  Check your inbox (and spam folder)
                </Text>
              </View>
              
              <View style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.instructionText}>
                  Click the verification link in the email
                </Text>
              </View>
              
              <View style={styles.instructionItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.instructionText}>
                  Return to the app and sign in
                </Text>
              </View>
            </View>

            <View style={styles.noteContainer}>
              <Ionicons name="information-circle-outline" size={20} color={Colors.primary.main} />
              <Text style={styles.noteText}>
                The verification link will expire in 24 hours
              </Text>
            </View>
          </View>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.replace('/signin')}
            >
              <Text style={styles.primaryButtonText}>Go to Sign In</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.replace('/signup')}
            >
              <Text style={styles.secondaryButtonText}>Sign Up with Different Email</Text>
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
    paddingTop: 40,
    paddingBottom: 60,
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
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
  },
  
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  
  message: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  
  email: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary.main,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
  },
  
  instructionsContainer: {
    backgroundColor: Colors.background.default,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  
  stepNumber: {
    width: 32,
    height: 32,
    backgroundColor: Colors.primary.main,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  
  stepNumberText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.white,
  },
  
  instructionText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[700],
    paddingTop: 6,
  },
  
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.light,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  
  noteText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.primary.dark,
  },
  
  footer: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing['2xl'],
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
