import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import AIInsightsScreen from '../screens/AIInsightsScreen';
import HomeScreen from '../screens/HomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SplashScreen from '../screens/SplashScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f0f1e',
          borderTopColor: '#00d4ff',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#00d4ff',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Portfolio" 
        component={PortfolioScreen}
        options={{ tabBarLabel: 'Portfolio' }}
      />
      <Tab.Screen 
        name="AIInsights" 
        component={AIInsightsScreen}
        options={{ tabBarLabel: 'AI Insights' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainApp" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
