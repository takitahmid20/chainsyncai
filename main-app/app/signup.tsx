/**
 * Signup Screen
 * Integrated with Django backend API
 * Design matches signin.tsx style
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { authService, SignupData } from '../services/authService';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { BorderRadius, Spacing } from '@/constants/Spacing';

export default function SignupScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    password: '',
    user_type: 'retailer',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  /**
   * Validate email format
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate password (6 digits)
   */
  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^\d{6}$/;
    return passwordRegex.test(password);
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors = {
      email: '',
      password: '',
    };
    let isValid = true;

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be exactly 6 digits';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Handle signup
   */
  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await authService.signup({
        email: formData.email,
        password: formData.password,
        user_type: formData.user_type,
      });
      
      // Navigate to email verification message page
      router.push({
        pathname: '/email-verification-sent',
        params: { 
          email: formData.email,
          message: response.message || 'Please check your email to verify your account.',
        },
      });
    } catch (error: any) {
      // Handle validation errors from backend
      if (error?.response?.data) {
        const errorData = error.response.data;
        const newErrors = {
          email: '',
          password: '',
        };
        
        // Map backend errors to form fields
        if (errorData.email) {
          newErrors.email = Array.isArray(errorData.email) 
            ? errorData.email[0] 
            : errorData.email;
        }
        if (errorData.password) {
          newErrors.password = Array.isArray(errorData.password) 
            ? errorData.password[0] 
            : errorData.password;
        }
        
        // If we have field-specific errors, show them
        if (newErrors.email || newErrors.password) {
          setErrors(newErrors);
        } else {
          // Show generic error message
          Alert.alert(
            'Signup Failed',
            errorData.message || errorData.detail || 'An error occurred during signup',
            [{ text: 'OK' }]
          );
        }
      } else {
        // Network or other errors
        Alert.alert(
          'Signup Failed',
          error instanceof Error ? error.message : 'An error occurred during signup',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    Alert.alert('Coming Soon', 'Google sign up will be available soon!');
  };

  const handleFacebookSignIn = () => {
    Alert.alert('Coming Soon', 'Facebook sign up will be available soon!');
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          nestedScrollEnabled={false}
        >
        {/* Header */}
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="layers-outline" size={36} color="#6366f1" />
            </View>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join ChainSync AI today</Text>
        </LinearGradient>

        {/* Form Content */}
        <View style={styles.content}>
          {/* User Type Selection */}
          <Text style={styles.label}>I am a</Text>
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                formData.user_type === 'retailer' && styles.userTypeButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, user_type: 'retailer' })}
              disabled={loading}
            >
              <Ionicons
                name="storefront"
                size={24}
                color={formData.user_type === 'retailer' ? '#fff' : Colors.primary.main}
              />
              <Text
                style={[
                  styles.userTypeText,
                  formData.user_type === 'retailer' && styles.userTypeTextActive,
                ]}
              >
                Retailer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.userTypeButton,
                formData.user_type === 'supplier' && styles.userTypeButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, user_type: 'supplier' })}
              disabled={loading}
            >
              <Ionicons
                name="business"
                size={24}
                color={formData.user_type === 'supplier' ? '#fff' : Colors.primary.main}
              />
              <Text
                style={[
                  styles.userTypeText,
                  formData.user_type === 'supplier' && styles.userTypeTextActive,
                ]}
              >
                Supplier
              </Text>
            </TouchableOpacity>
          </View>

          <Input
            label="Email Address"
            placeholder="your@email.com"
            value={formData.email}
            onChangeText={(text) => {
              setFormData({ ...formData, email: text });
              setErrors({ ...errors, email: '' });
            }}
            error={errors.email}
            type="email"
            autoCapitalize="none"
            editable={!loading}
          />

          <Input
            label="Password (6 digits)"
            placeholder="Enter 6-digit password"
            value={formData.password}
            onChangeText={(text) => {
              if (/^\d*$/.test(text) && text.length <= 6) {
                setFormData({ ...formData, password: text });
                setErrors({ ...errors, password: '' });
              }
            }}
            error={errors.password}
            type="password"
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />

          {/* Sign Up Button */}
          <Button
            title="Sign Up"
            onPress={handleSignup}
            loading={loading}
            fullWidth
            style={styles.signUpButton}
          />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
              <Ionicons name="logo-google" size={20} color="#EA4335" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} onPress={handleFacebookSignIn}>
              <Ionicons name="logo-facebook" size={20} color="#1877F2" />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signin')}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.paper,
  },
  
  scrollContent: {
    flexGrow: 1,
  },
  
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: Spacing['2xl'],
    alignItems: 'center',
  },
  
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  
  logo: {
    width: 60,
    height: 60,
    backgroundColor: Colors.background.paper,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  title: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.white,
    marginBottom: Spacing.sm,
  },
  
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  
  content: {
    flex: 1,
    padding: Spacing['2xl'],
    backgroundColor: Colors.background.paper,
  },
  
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[700],
    marginBottom: Spacing.md,
  },
  
  userTypeContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  
  userTypeButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.paper,
  },
  
  userTypeButtonActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  
  userTypeText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[700],
  },
  
  userTypeTextActive: {
    color: Colors.text.white,
  },
  
  signUpButton: {
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing['2xl'],
  },
  
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.light,
  },
  
  dividerText: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral[400],
  },
  
  socialButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.paper,
  },
  
  socialButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[700],
  },
  
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  signInText: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[600],
  },
  
  signInLink: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary.main,
    fontWeight: Typography.fontWeight.semibold,
  },
});
