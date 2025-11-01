import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const PortfolioScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Portfolio</Text>
      <Text style={styles.comingSoon}>Coming Soon</Text>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00d4ff',
    marginBottom: 20,
  },
  comingSoon: {
    fontSize: 18,
    color: '#b0b0b0',
  },
});

export default PortfolioScreen;
