import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  onPress,
  style,
  textStyle,
  ...rest
}) => {
  const handlePress = (e: any) => {
    if (disabled || loading) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}
    onPress?.(e);
  };

  const getContainerStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle = { ...styles.base, ...styles[`size_${size}`] };
    if (disabled) return [baseStyle, styles.disabled];

    switch (variant) {
      case 'secondary':
        return [baseStyle, styles.secondary];
      case 'outline':
        return [baseStyle, styles.outline];
      case 'ghost':
        return [baseStyle, styles.ghost];
      case 'danger':
        return [baseStyle, styles.danger];
      case 'primary':
      default:
        return [baseStyle, styles.primary];
    }
  };

  const getTextStyle = (): TextStyle[] => {
    const baseText: TextStyle = { ...styles.baseText, ...styles[`text_${size}`] };
    if (disabled) return [baseText, styles.disabledText];

    switch (variant) {
      case 'secondary':
        return [baseText, styles.secondaryText];
      case 'outline':
        return [baseText, styles.outlineText];
      case 'ghost':
        return [baseText, styles.ghostText];
      case 'danger':
        return [baseText, styles.dangerText];
      case 'primary':
      default:
        return [baseText, styles.primaryText];
    }
  };

  return (
    <TouchableOpacity
      style={[getContainerStyle(), style]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      onPress={handlePress}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? Colors.light.primary : '#FFFFFF'}
        />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), icon ? { marginLeft: Spacing.sm } : null, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
  },
  size_sm: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: 40,
  },
  size_md: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    height: 52,
  },
  size_lg: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    height: 60,
  },
  primary: {
    backgroundColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  secondary: {
    backgroundColor: Colors.light.primaryLight,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: Colors.light.accentRed,
  },
  disabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  baseText: {
    fontFamily: Typography.fontFamily.bold,
    textAlign: 'center',
  },
  text_sm: {
    fontSize: Typography.fontSize.sm,
  },
  text_md: {
    fontSize: Typography.fontSize.md,
  },
  text_lg: {
    fontSize: Typography.fontSize.lg,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: Colors.light.primary,
  },
  outlineText: {
    color: Colors.light.primary,
  },
  ghostText: {
    color: Colors.light.primary,
  },
  dangerText: {
    color: '#FFFFFF',
  },
  disabledText: {
    color: '#94A3B8',
  },
});
