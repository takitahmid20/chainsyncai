/**
 * Retailer Edit Profile Screen
 * Edit account and business information, manage settings
 * Based on html2/retailer/profile.html design
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Spacing, BorderRadius } from '@/constants/Spacing';
import { retailerService } from '@/services/retailerService';

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  shop_name: string;
  business_type: string;
  address: string;
  trade_license: string;
}

export default function EditProfileScreen() {
  const [activeTab, setActiveTab] = useState<'account' | 'business'>('account');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [accountData, setAccountData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '••••••••',
  });

  const [businessData, setBusinessData] = useState({
    shop_name: '',
    business_type: 'retail_store',
    address: '',
    trade_license: '',
  });

  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    rating: 0,
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const profile = await retailerService.getProfile();
      
      setAccountData({
        full_name: profile.owner_name || '',
        email: profile.owner_email || '',
        phone: profile.phone_number || '',
        password: '••••••••',
      });

      setBusinessData({
        shop_name: profile.shop_name || '',
        business_type: profile.business_type || 'retail_store',
        address: profile.address || '',
        trade_license: profile.trade_license_number || '',
      });

      // Mock stats - replace with actual API calls
      setStats({
        products: 156,
        orders: 482,
        rating: 4.8,
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAccount = async () => {
    try {
      setIsSaving(true);
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Account information updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update account information');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBusiness = async () => {
    try {
      setIsSaving(true);
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Business information updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update business information');
    } finally {
      setIsSaving(false);
    }
  };

  const renderTabButtons = () => (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'account' && styles.tabActive]}
          onPress={() => setActiveTab('account')}
        >
          <Ionicons
            name="person-outline"
            size={18}
            color={activeTab === 'account' ? Colors.primary.main : Colors.neutral[600]}
          />
          <Text style={[styles.tabText, activeTab === 'account' && styles.tabTextActive]}>
            Account
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'business' && styles.tabActive]}
          onPress={() => setActiveTab('business')}
        >
          <Ionicons
            name="briefcase-outline"
            size={18}
            color={activeTab === 'business' ? Colors.primary.main : Colors.neutral[600]}
          />
          <Text style={[styles.tabText, activeTab === 'business' && styles.tabTextActive]}>
            Business
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderAccountTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Account Information</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={accountData.full_name}
          onChangeText={(text) => setAccountData({ ...accountData, full_name: text })}
          placeholder="Enter your name"
          placeholderTextColor={Colors.neutral[400]}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={accountData.email}
          onChangeText={(text) => setAccountData({ ...accountData, email: text })}
          placeholder="Enter email"
          placeholderTextColor={Colors.neutral[400]}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={accountData.phone}
          onChangeText={(text) => setAccountData({ ...accountData, phone: text })}
          placeholder="Enter phone"
          placeholderTextColor={Colors.neutral[400]}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={accountData.password}
            onChangeText={(text) => setAccountData({ ...accountData, password: text })}
            placeholder="Enter password"
            placeholderTextColor={Colors.neutral[400]}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={Colors.neutral[500]}
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={handleSaveAccount}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderBusinessTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Business Information</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Store Name</Text>
        <TextInput
          style={styles.input}
          value={businessData.shop_name}
          onChangeText={(text) => setBusinessData({ ...businessData, shop_name: text })}
          placeholder="Enter store name"
          placeholderTextColor={Colors.neutral[400]}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Business Type</Text>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerText}>
            {businessData.business_type === 'retail_store' ? 'Retail Store' :
             businessData.business_type === 'grocery' ? 'Grocery Shop' :
             businessData.business_type === 'convenience' ? 'Convenience Store' :
             businessData.business_type === 'supermarket' ? 'Supermarket' : 'Wholesale'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={Colors.neutral[400]} />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Store Address</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={businessData.address}
          onChangeText={(text) => setBusinessData({ ...businessData, address: text })}
          placeholder="Enter full address"
          placeholderTextColor={Colors.neutral[400]}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Trade License Number</Text>
        <TextInput
          style={styles.input}
          value={businessData.trade_license}
          onChangeText={(text) => setBusinessData({ ...businessData, trade_license: text })}
          placeholder="Enter trade license number"
          placeholderTextColor={Colors.neutral[400]}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={handleSaveBusiness}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Save Business Info</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge}>
          <Ionicons name="person" size={40} color={Colors.primary.main} />
          <TouchableOpacity style={styles.avatarEditButton}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.profileName}>{businessData.shop_name || 'Shop Name'}</Text>
        <Text style={styles.profileSubtitle}>Premium Retailer • Member since Jan 2025</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="cube-outline" size={20} color={Colors.neutral[600]} />
            <Text style={styles.statValue}>{stats.products}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="cart-outline" size={20} color={Colors.neutral[600]} />
            <Text style={styles.statValue}>{stats.orders}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="star" size={20} color="#fbbf24" />
            <Text style={styles.statValue}>{stats.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      {renderTabButtons()}

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'account' && renderAccountTab()}
        {activeTab === 'business' && renderBusinessTab()}
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.default,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[600],
  },
  
  // Profile Header
  profileHeader: {
    backgroundColor: Colors.background.paper,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary.light + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 3,
    borderColor: Colors.primary.main,
  },
  avatarEditButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.background.paper,
  },
  profileName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.neutral[600],
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border.light,
  },

  // Tabs
  tabsContainer: {
    backgroundColor: Colors.background.paper,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  tabsScroll: {
    paddingHorizontal: Spacing.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary.main,
  },
  tabText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.neutral[600],
  },
  tabTextActive: {
    color: Colors.primary.main,
    fontWeight: Typography.fontWeight.semibold,
  },

  // Content
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing.lg,
  },

  // Form
  formGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.neutral[700],
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.background.paper,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[900],
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.paper,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.md,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[900],
  },
  passwordToggle: {
    padding: Spacing.md,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.paper,
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  pickerText: {
    fontSize: Typography.fontSize.base,
    color: Colors.neutral[900],
  },

  // Toggle
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  toggleInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  toggleTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.neutral[600],
    lineHeight: 18,
  },

  // Save Button
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: '#fff',
  },
});
