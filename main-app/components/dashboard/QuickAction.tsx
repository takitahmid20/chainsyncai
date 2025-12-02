/**
 * Quick Action Button Component
 * For quick access features on dashboard
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { BorderRadius, Spacing } from '@/constants/Spacing';

interface QuickActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  active?: boolean;
}

export const QuickAction: React.FC<QuickActionProps> = ({
  icon,
  label,
  onPress,
  active = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, active && styles.containerActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, active && styles.iconContainerActive]}>
        <Ionicons
          name={icon}
          size={24}
          color={active ? Colors.text.white : Colors.primary.main}
        />
      </View>
      <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 80,
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  
  containerActive: {
    opacity: 1,
  },
  
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: Colors.background.default,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  
  iconContainerActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  
  label: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.neutral[700],
    textAlign: 'center',
  },
  
  labelActive: {
    color: Colors.primary.main,
  },
});
