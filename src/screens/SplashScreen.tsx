import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Onboarding' as never);
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>ChainSync AI</Text>
      <Text style={styles.tagline}>Your Crypto Portfolio Manager</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#00d4ff',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
});

export default SplashScreen;
