/**
 * AI Insight Card Component
 * Displays AI-generated insights and recommendations
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { BorderRadius, Spacing } from '@/constants/Spacing';

interface AIInsightCardProps {
  title: string;
  message: string;
  priority?: 'high' | 'medium' | 'low';
  actionLabel?: string;
  onAction?: () => void;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  title,
  message,
  priority = 'medium',
  actionLabel,
  onAction,
}) => {
  const getPriorityConfig = () => {
    switch (priority) {
      case 'high':
        return {
          colors: ['#ef4444', '#dc2626'],
          icon: 'alert-circle' as keyof typeof Ionicons.glyphMap,
          badgeColor: Colors.error.main,
        };
      case 'low':
        return {
          colors: ['#10b981', '#059669'],
          icon: 'information-circle' as keyof typeof Ionicons.glyphMap,
          badgeColor: Colors.success.main,
        };
      default:
        return {
          colors: ['#f59e0b', '#d97706'],
          icon: 'bulb' as keyof typeof Ionicons.glyphMap,
          badgeColor: Colors.warning.main,
        };
    }
  };

  const config = getPriorityConfig();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[...config.colors, 'rgba(0,0,0,0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1}}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name={config.icon} size={20} color={Colors.text.white} />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.message}>{message}</Text>
        {actionLabel && onAction && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onAction}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>{actionLabel}</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.text.white} />
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  gradient: {
    padding: Spacing.lg,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  
  iconContainer: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  
  title: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.white,
  },
  
  message: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  
  actionButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.white,
  },
});
