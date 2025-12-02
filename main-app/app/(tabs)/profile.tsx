/**
 * Retailer Dashboard - Profile Screen
 * User profile with settings and logout
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '@/services/authService';
import { retailerService, RetailerProfile } from '@/services/retailerService';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing } from '@/constants/Spacing';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [profileData, setProfileData] = useState<RetailerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    loadUserInfo();
    loadProfileData();
  }, []);

  const loadUserInfo = async () => {
    try {
      const user = await authService.getCurrentUser();
      setUserInfo(user);
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  };

  const loadProfileData = async () => {
    try {
      setIsLoadingProfile(true);
      const profile = await retailerService.getProfile();
      setProfileData(profile);
    } catch (error: any) {
      console.error('Profile loading error:', error.response?.data);
      Alert.alert('Error', 'Failed to load profile data.');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleLogout = () => {
    console.log('🔴 [LOGOUT] Button clicked');
    
    // For web, use native confirm
    if (Platform.OS === 'web') {
      console.log('🔴 [LOGOUT] Using web confirm...');
      const confirmed = window.confirm('Are you sure you want to logout?');
      console.log('🔴 [LOGOUT] Web confirm result:', confirmed);
      if (confirmed) {
        performLogout();
      } else {
        console.log('🔴 [LOGOUT] Cancelled');
      }
    } else {
      // For native, use Alert
      console.log('🔴 [LOGOUT] Using Alert...');
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: () => console.log('🔴 [LOGOUT] Cancelled'),
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: () => {
              console.log('🔴 [LOGOUT] Confirmed');
              performLogout();
            },
          },
        ]
      );
    }
  };

  const performLogout = async () => {
    console.log('🔴 [LOGOUT] Starting logout process...');
    setIsLoading(true);
    
    try {
      console.log('🔴 [LOGOUT] Calling authService.logout()...');
      await authService.logout();
      console.log('🔴 [LOGOUT] Auth cleared successfully');
      
      console.log('🔴 [LOGOUT] Navigating to /signin...');
      router.replace('/signin');
      console.log('🔴 [LOGOUT] Navigation complete');
    } catch (error) {
      console.error('🔴 [LOGOUT] Error:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient
          colors={[Colors.primary.main, '#a855f7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {isLoadingProfile ? '...' : profileData?.owner_name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </View>
          <Text style={styles.userName}>
            {isLoadingProfile ? 'Loading...' : profileData?.shop_name || 'Shop Name'}
          </Text>
          <Text style={styles.userRole}>
            {isLoadingProfile ? 'Loading...' : profileData?.owner_name || 'Owner Name'}
          </Text>
        </LinearGradient>

        {/* Profile Options */}
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="person-outline" size={20} color={Colors.primary.main} />
              </View>
              <Text style={styles.menuLabel}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="key-outline" size={20} color={Colors.primary.main} />
              </View>
              <Text style={styles.menuLabel}>Change Password</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="notifications-outline" size={20} color={Colors.primary.main} />
              </View>
              <Text style={styles.menuLabel}>Notifications</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="language-outline" size={20} color={Colors.primary.main} />
              </View>
              <Text style={styles.menuLabel}>Language</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="moon-outline" size={20} color={Colors.primary.main} />
              </View>
              <Text style={styles.menuLabel}>Dark Mode</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="help-circle-outline" size={20} color={Colors.primary.main} />
              </View>
              <Text style={styles.menuLabel}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="information-circle-outline" size={20} color={Colors.primary.main} />
              </View>
              <Text style={styles.menuLabel}>About</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            style={[styles.logoutButton, isLoading && styles.logoutButtonDisabled]} 
            onPress={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text style={styles.logoutText}>Logging out...</Text>
              </>
            ) : (
              <>
                <Ionicons name="log-out-outline" size={20} color="#ffffff" />
                <Text style={styles.logoutText}>Logout</Text>
              </>
            )}
          </TouchableOpacity>

          {/* App Version */}
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'capitalize',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.paper,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: `${Colors.primary.main}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.neutral[900],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error.main,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
    shadowColor: Colors.error.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  version: {
    fontSize: 12,
    color: Colors.neutral[400],
    textAlign: 'center',
    marginTop: 24,
  },
});
