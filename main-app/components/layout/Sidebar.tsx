/**
 * Sidebar Component
 * Navigation drawer with user profile and menu items
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
}

interface MenuItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: 'home-outline', route: '/(tabs)' },
  { label: 'Inventory Management', icon: 'cube-outline', route: '/(tabs)/inventory' },
  { label: 'Orders', icon: 'receipt-outline', route: '/(tabs)/orders' },
  { label: 'AI Insights', icon: 'flash-outline', route: '/(tabs)/ai' },
  { label: 'Finance & Loans', icon: 'cash-outline', route: '/finance' },
  { label: 'Customers', icon: 'people-outline', route: '/customers' },
  { label: 'Chat AI Assistant', icon: 'chatbubble-outline', route: '/chat-ai' },
  { label: 'Reports & Analytics', icon: 'bar-chart-outline', route: '/reports' },
  { label: 'Settings & Profile', icon: 'settings-outline', route: '/(tabs)/profile' },
];

export default function Sidebar({
  visible,
  onClose,
  userName = 'Arif Rahman',
  userEmail = 'arif@retailshop.com',
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const slideAnim = useRef(new Animated.Value(-280)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -280,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleNavigate = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 300);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            onClose();
            await logout();
            router.replace('/signin');
          },
        },
      ]
    );
  };

  const isActive = (route: string) => {
    if (route === '/(tabs)') {
      return pathname === '/';
    }
    return pathname.includes(route.replace('/(tabs)', ''));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Overlay */}
        <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Sidebar */}
        <Animated.View
          style={[
            styles.sidebar,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.profileSection}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.userEmail}>{userEmail}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close-outline" size={20} color={Colors.neutral[600]} />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.route}
                style={[
                  styles.menuItem,
                  isActive(item.route) && styles.menuItemActive,
                ]}
                onPress={() => handleNavigate(item.route)}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={isActive(item.route) ? Colors.primary.main : Colors.neutral[600]}
                />
                <Text
                  style={[
                    styles.menuLabel,
                    isActive(item.route) && styles.menuLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
            
            {/* Logout Button */}
            <TouchableOpacity
              style={[styles.menuItem, styles.logoutButton]}
              onPress={handleLogout}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color={Colors.error.main}
              />
              <Text style={[styles.menuLabel, styles.logoutText]}>
                Logout
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: Colors.background.paper,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarLarge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border.light,
  },
  avatarLargeText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.neutral[900],
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.neutral[600],
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  menuItemActive: {
    backgroundColor: '#eff6ff',
    borderLeftColor: Colors.primary.main,
  },
  menuLabel: {
    fontSize: 14,
    color: Colors.neutral[600],
  },
  menuLabelActive: {
    color: Colors.primary.main,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    paddingTop: 20,
  },
  logoutText: {
    color: Colors.error.main,
    fontWeight: '600',
  },
});
