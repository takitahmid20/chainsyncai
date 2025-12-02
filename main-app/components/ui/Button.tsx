import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { BorderRadius, Spacing } from '@/constants/Spacing';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
}) => {
  const buttonStyle: ViewStyle[] = [
    styles.button,
    styles[`size_${size}`],
    fullWidth ? styles.fullWidth : {},
    disabled ? styles.disabled : {},
    style || {},
  ];

  const textStyle: TextStyle[] = [
    styles.text,
    styles[`text_${size}`],
    variant === 'outline' ? styles.textOutline : {},
    variant === 'text' ? styles.textOnly : {},
  ];

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.text.white : Colors.primary.main}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text style={textStyle}>{title}</Text>
        </>
      )}
    </>
  );

  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}>
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={buttonStyle}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        buttonStyle,
        variant === 'outline' && styles.outline,
        variant === 'text' && styles.textButton,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  
  size_sm: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  
  size_md: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  
  size_lg: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
  },
  
  fullWidth: {
    width: '100%',
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.border.light,
  },
  
  textButton: {
    backgroundColor: 'transparent',
  },
  
  disabled: {
    opacity: 0.5,
  },
  
  text: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.white,
  },
  
  text_sm: {
    fontSize: Typography.fontSize.md,
  },
  
  text_md: {
    fontSize: Typography.fontSize.lg,
  },
  
  text_lg: {
    fontSize: Typography.fontSize.xl,
  },
  
  textOutline: {
    color: Colors.primary.main,
  },
  
  textOnly: {
    color: Colors.primary.main,
  },
});
