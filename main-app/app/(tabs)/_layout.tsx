/**
 * Retailer Tabs Layout
 * Bottom navigation for retailer dashboard with top navbar and sidebar
 */

import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import TopNavbar from '@/components/layout/TopNavbar';
import Sidebar from '@/components/layout/Sidebar';
import { Alert } from 'react-native';

export default function RetailerTabLayout() {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleNotificationPress = () => {
    Alert.alert('Notifications', '3 new updates available');
  };

  const handleProfilePress = () => {
    setSidebarVisible(false);
    setTimeout(() => {
      // Navigation will be handled by tab
    }, 300);
  };

  return (
    <>
      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        userName="Arif Rahman"
        userEmail="arif@retailshop.com"
      />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary.main,
          tabBarInactiveTintColor: Colors.neutral[400],
          header: () => (
            <TopNavbar
              onMenuPress={() => setSidebarVisible(true)}
              notificationCount={3}
              onNotificationPress={handleNotificationPress}
              onProfilePress={handleProfilePress}
            />
          ),
          headerShown: true,
          tabBarStyle: {
            backgroundColor: Colors.background.paper,
            borderTopWidth: 1,
            borderTopColor: Colors.border.light,
            paddingBottom: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
          },
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'AI',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flash-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide this legacy tab
        }}
      />
    </Tabs>
    </>
  );
}
