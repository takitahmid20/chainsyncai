/**
 * Supplier Tabs Layout
 * Bottom navigation for supplier dashboard
 */

import { Tabs } from 'expo-router';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import TopNavbar from '@/components/layout/TopNavbar';
import Sidebar from '@/components/layout/Sidebar';
import { Alert } from 'react-native';

export default function SupplierTabLayout() {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleNotificationPress = () => {
    Alert.alert('Notifications', '2 new updates available');
  };

  const handleProfilePress = () => {
    setSidebarVisible(false);
  };

  return (
    <>
      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        userName="Supplier User"
        userEmail="supplier@company.com"
      />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary.main,
          tabBarInactiveTintColor: Colors.neutral[400],
          header: () => (
            <TopNavbar
              onMenuPress={() => setSidebarVisible(true)}
              notificationCount={2}
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
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="grid-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Orders',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="products"
          options={{
            title: 'Products',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cube-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: 'Analytics',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bar-chart-outline" size={size} color={color} />
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
      </Tabs>
    </>
  );
}
