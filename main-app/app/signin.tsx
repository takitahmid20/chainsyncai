import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { BorderRadius, Spacing } from '@/constants/Spacing';

export default function SignInScreen() {
  const { checkAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be exactly 6 digits';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignIn = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({
        email,
        password,
      });
      
      // Refresh auth context
      await checkAuth();
      
      // Navigate based on user type
      if (response.user.user_type === 'retailer') {
        router.replace('/(tabs)');
      } else if (response.user.user_type === 'supplier') {
        router.replace('/(supplier)');
      } else {
        // Fallback to retailer tabs
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      // Handle validation errors from backend
      if (error?.response?.data) {
        const errorData = error.response.data;
        const errorStatus = error.response.status;
        
        // Check for email verification error (403 Forbidden)
        if (errorStatus === 403 && errorData.error?.includes('verify')) {
          Alert.alert(
            'Email Not Verified',
            'Please verify your email before logging in. Check your inbox for the verification link.',
            [
              {
                text: 'Resend Email',
                onPress: () => {
                  // TODO: Implement resend verification email
                  Alert.alert('Coming Soon', 'Resend verification email feature will be available soon.');
                },
              },
              { text: 'OK', style: 'cancel' }
            ]
          );
          return;
        }
        
        // Check for invalid credentials (401 Unauthorized)
        if (errorStatus === 401) {
          Alert.alert(
            'Sign In Failed',
            errorData.error || 'Invalid email or password',
            [{ text: 'OK' }]
          );
          return;
        }
        
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
            'Sign In Failed',
            errorData.error || errorData.message || errorData.detail || 'An error occurred during sign in',
            [{ text: 'OK' }]
          );
        }
      } else {
        // Network or other errors
        Alert.alert(
          'Sign In Failed',
          error instanceof Error ? error.message : 'An error occurred during sign in',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log('Google Sign In');
  };

  const handleFacebookSignIn = () => {
    console.log('Facebook Sign In');
  };

  const handleQuickLogin = (type: 'retailer' | 'supplier') => {
    if (type === 'retailer') {
      setEmail('takitahmid25+retailer@gmail.com');
      setPassword('123456');
    } else {
      setEmail('takitahmid25+supplier@gmail.com');
      setPassword('123456');
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue to ChainSync AI</Text>
        </LinearGradient>

        {/* Form Content */}
        <View style={styles.content}>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={[styles.textInput, errors.email && styles.textInputError]}
                  placeholder="your@email.com"
                  placeholderTextColor={Colors.neutral[400]}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors({ ...errors, email: '' });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Password (6 digits)</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter 6-digit password"
                    placeholderTextColor={Colors.neutral[400]}
                    value={password}
                    onChangeText={(text) => {
                      if (/^\d*$/.test(text) && text.length <= 6) {
                        setPassword(text);
                        setErrors({ ...errors, password: '' });
                      }
                    }}
                    secureTextEntry={true}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!loading}
                  />
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>

              {/* Quick Login Buttons for Testing */}
              <View style={styles.quickLoginContainer}>
                <Text style={styles.quickLoginLabel}>Quick Login (Testing):</Text>
                <View style={styles.quickLoginButtons}>
                  <TouchableOpacity
                    style={styles.quickLoginButton}
                    onPress={() => handleQuickLogin('retailer')}
                    disabled={loading}
                  >
                    <Ionicons name="storefront-outline" size={18} color="#6366f1" />
                    <Text style={styles.quickLoginButtonText}>Retailer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickLoginButton}
                    onPress={() => handleQuickLogin('supplier')}
                    disabled={loading}
                  >
                    <Ionicons name="business-outline" size={18} color="#8b5cf6" />
                    <Text style={styles.quickLoginButtonText}>Supplier</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remember Me & Forgot Password */}
              <View style={styles.rememberForgot}>
                <TouchableOpacity
                  style={styles.rememberMe}
                  onPress={() => setRememberMe(!rememberMe)}
                  disabled={loading}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => router.push('/forgot-password')}
                  disabled={loading}
                >
                  <Text style={styles.forgotLink}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Sign In Button */}
              <Button
                title="Sign In"
                onPress={handleSignIn}
                loading={loading}
                fullWidth
                style={styles.signInButton}
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

              {/* Sign Up Link */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/signup')}>
                  <Text style={styles.signupLink}>Sign Up</Text>
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
  
  rememberForgot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  checkboxChecked: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  
  rememberText: {
    fontSize: Typography.fontSize.md,
    color: Colors.neutral[600],
  },
  
  forgotLink: {
    fontSize: Typography.fontSize.md,
    color: Colors.primary.main,
    fontWeight: Typography.fontWeight.semibold,
  },

  formGroup: {
    marginBottom: Spacing.xl,
  },

  inputLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[700],
    marginBottom: Spacing.sm,
  },

  textInput: {
    backgroundColor: Colors.background.paper,
    borderWidth: 2,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },

  textInputError: {
    borderColor: Colors.error.main,
  },

  passwordContainer: {
    backgroundColor: Colors.background.paper,
    borderWidth: 2,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.md,
  },

  passwordInput: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },

  errorText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.error.main,
    marginTop: Spacing.xs,
  },

  quickLoginContainer: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },

  quickLoginLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
    marginBottom: Spacing.sm,
    fontWeight: Typography.fontWeight.medium,
  },

  quickLoginButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  quickLoginButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background.paper,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.primary.main,
  },

  quickLoginButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary.main,
    fontWeight: Typography.fontWeight.semibold,
  },
  
  signInButton: {
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
  
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  signupText: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[600],
  },
  
  signupLink: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary.main,
    fontWeight: Typography.fontWeight.semibold,
  },
});
