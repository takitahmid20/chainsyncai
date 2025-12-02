/**
 * Top Navbar Component
 * Displays app branding, hamburger menu, and action buttons
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface TopNavbarProps {
  onMenuPress: () => void;
  notificationCount?: number;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export default function TopNavbar({
  onMenuPress,
  notificationCount = 0,
  onNotificationPress,
  onProfilePress,
}: TopNavbarProps) {
  return (
    <View style={styles.container}>
      {/* Hamburger Menu */}
      <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
        <Ionicons name="menu-outline" size={24} color={Colors.neutral[900]} />
      </TouchableOpacity>

      {/* Brand */}
      <View style={styles.brandContainer}>
        <Text style={styles.brandText}>ChainSync AI</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {/* Notifications */}
        <TouchableOpacity style={styles.iconButton} onPress={onNotificationPress}>
          <Ionicons name="notifications-outline" size={22} color={Colors.neutral[900]} />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Profile Avatar */}
        <TouchableOpacity style={styles.avatarButton} onPress={onProfilePress}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.paper,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  brandContainer: {
    flex: 1,
    alignItems: 'center',
  },
  brandText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.error.main,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  avatarButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
