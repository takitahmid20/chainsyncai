import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  View,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { BorderRadius, Spacing } from '@/constants/Spacing';
import { Ionicons } from '@expo/vector-icons';

interface SocialButtonProps {
  provider: 'google' | 'facebook';
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  onPress,
  disabled = false,
  style,
}) => {
  const config = {
    google: {
      icon: 'logo-google' as keyof typeof Ionicons.glyphMap,
      label: 'Continue with Google',
      color: '#DB4437',
    },
    facebook: {
      icon: 'logo-facebook' as keyof typeof Ionicons.glyphMap,
      label: 'Continue with Facebook',
      color: '#1877F2',
    },
  };

  const { icon, label, color } = config[provider];

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Ionicons name={icon} size={20} color={color} />
        <Text style={styles.label}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    backgroundColor: Colors.background.paper,
    borderWidth: 2,
    borderColor: Colors.border.light,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  
  disabled: {
    opacity: 0.5,
  },
});
