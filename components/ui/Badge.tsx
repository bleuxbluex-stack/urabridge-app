import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'der' | 'die' | 'das' | 'neutral';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
}) => {
  const getBadgeStyle = (): ViewStyle => {
    switch (variant) {
      case 'success':
        return { backgroundColor: Colors.light.successLight };
      case 'warning':
        return { backgroundColor: '#FEF3C7' };
      case 'error':
        return { backgroundColor: Colors.light.errorLight };
      case 'der':
        return { backgroundColor: '#DBEAFE' };
      case 'die':
        return { backgroundColor: '#FCE7F3' };
      case 'das':
        return { backgroundColor: '#FEF3C7' };
      case 'neutral':
        return { backgroundColor: Colors.light.surfaceSecondary };
      case 'primary':
      default:
        return { backgroundColor: Colors.light.primaryLight };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'success':
        return { color: Colors.light.success };
      case 'warning':
        return { color: Colors.light.accentGold };
      case 'error':
        return { color: Colors.light.accentRed };
      case 'der':
        return { color: Colors.light.der };
      case 'die':
        return { color: Colors.light.die };
      case 'das':
        return { color: Colors.light.das };
      case 'neutral':
        return { color: Colors.light.textSecondary };
      case 'primary':
      default:
        return { color: Colors.light.primary };
    }
  };

  return (
    <View style={[styles.base, styles[`size_${size}`], getBadgeStyle(), style]}>
      <Text style={[styles.text, styles[`text_${size}`], getTextStyle(), textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  size_sm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  size_md: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  text: {
    fontFamily: Typography.fontFamily.bold,
  },
  text_sm: {
    fontSize: Typography.fontSize.xs,
  },
  text_md: {
    fontSize: Typography.fontSize.sm,
  },
});
