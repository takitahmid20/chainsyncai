import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const userTypes = [
  { id: 'manufacturer', label: 'Manufacturer / SME', icon: '🏭' },
  { id: 'supplier', label: 'Supplier / Vendor', icon: '🏪' },
  { id: 'retailer', label: 'Retailer / Distributor', icon: '🛒' },
  { id: 'logistics', label: 'Logistics Partner', icon: '🚚' },
];

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [selectedUserType, setSelectedUserType] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = () => {
    // TODO: Implement sign-up validation and logic
    if (selectedUserType && companyName && fullName && businessEmail && phoneNumber && password && confirmPassword) {
      if (password === confirmPassword) {
        navigation.navigate('MainApp' as never);
      } else {
        alert('Passwords do not match!');
      }
    } else {
      alert('Please fill all fields!');
    }
  };

  const handleSignIn = () => {
    // TODO: Navigate to sign-in screen
    console.log('Navigate to Sign In');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>⛓️</Text>
            </View>
            <Text style={styles.logo}>ChainSync AI</Text>
          </View>
          <Text style={styles.welcomeText}>Create Account</Text>
          <Text style={styles.subtitle}>Join our smart supply chain network</Text>
        </View>

        {/* Form Section */}
        <View style={styles.form}>
          {/* User Type Selector */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Select Your Business Type</Text>
            <View style={styles.userTypeGrid}>
              {userTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.userTypeCard,
                    selectedUserType === type.id && styles.userTypeCardSelected,
                  ]}
                  onPress={() => setSelectedUserType(type.id)}
                >
                  <Text style={styles.userTypeIcon}>{type.icon}</Text>
                  <Text style={[
                    styles.userTypeLabel,
                    selectedUserType === type.id && styles.userTypeLabelSelected,
                  ]}>
                    {type.label}
                  </Text>
                  {selectedUserType === type.id && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedCheck}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Company Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Company Name</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🏢</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your company name"
                placeholderTextColor="#7a7a8c"
                value={companyName}
                onChangeText={setCompanyName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Full Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#7a7a8c"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Business Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Business Email</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="company@example.com"
                placeholderTextColor="#7a7a8c"
                value={businessEmail}
                onChangeText={setBusinessEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Phone Number Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>📱</Text>
              <TextInput
                style={styles.input}
                placeholder="+880 1XXX-XXXXXX"
                placeholderTextColor="#7a7a8c"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a strong password"
                placeholderTextColor="#7a7a8c"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔐</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#7a7a8c"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Create Account Button */}
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={handleSignUp}
          >
            <Text style={styles.signUpButtonText}>Create Account</Text>
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleSignIn}>
              <Text style={styles.signInText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 30,
    paddingBottom: 30,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#00d4ff',
  },
  logoIcon: {
    fontSize: 32,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00d4ff',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
  },
  form: {
    flex: 1,
    paddingHorizontal: 30,
  },
  sectionContainer: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  userTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  userTypeCard: {
    width: '48%',
    backgroundColor: '#1a1f3a',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2d3250',
    position: 'relative',
  },
  userTypeCardSelected: {
    borderColor: '#00d4ff',
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
  },
  userTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  userTypeLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontWeight: '500',
  },
  userTypeLabelSelected: {
    color: '#00d4ff',
    fontWeight: '600',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheck: {
    color: '#0a0e27',
    fontSize: 14,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1f3a',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2d3250',
    paddingHorizontal: 16,
    height: 54,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#ffffff',
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 18,
  },
  signUpButton: {
    backgroundColor: '#00d4ff',
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
    shadowColor: '#00d4ff',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  signUpButtonText: {
    color: '#0a0e27',
    fontSize: 17,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    color: '#9ca3af',
    fontSize: 15,
  },
  signInText: {
    color: '#00d4ff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default SignUpScreen;
