/**
 * AI Summary Strip Component
 * Sticky banner showing AI insights at the top
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

interface AISummaryStripProps {
  message: string;
  onPress?: () => void;
}

export default function AISummaryStrip({
  message,
  onPress,
}: AISummaryStripProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={[Colors.primary.main, '#a855f7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Spark Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="flash" size={20} color="#ffffff" />
        </View>

        {/* Message Text */}
        <View style={styles.textContainer}>
          <Text style={styles.text}>
            <Text style={styles.boldText}>AI Insight: </Text>
            {message}
          </Text>
        </View>

        {/* Arrow Icon */}
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward-outline" size={16} color="#ffffff" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 10,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  text: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '600',
  },
  arrowContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
