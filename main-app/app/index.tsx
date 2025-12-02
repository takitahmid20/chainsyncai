import { useEffect } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function Index() {
  const { isAuthenticated, userType, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && userType) {
        // Redirect to appropriate dashboard based on user type
        if (userType === 'retailer') {
          router.replace('/(tabs)');
        } else if (userType === 'supplier') {
          router.replace('/(supplier)');
        }
      }
    }
  }, [loading, isAuthenticated, userType]);

  // Show loading while checking auth
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </View>
    );
  }

  // If not authenticated, redirect to splash
  if (!isAuthenticated) {
    return <Redirect href="/splash" />;
  }

  // Default loading state
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary.main} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.default,
  },
});
