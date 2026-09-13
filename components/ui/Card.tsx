import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'flat';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  style,
  ...rest
}) => {
  const getCardStyle = (): ViewStyle[] => {
    switch (variant) {
      case 'outlined':
        return [styles.base, styles.outlined];
      case 'flat':
        return [styles.base, styles.flat];
      case 'elevated':
      default:
        return [styles.base, styles.elevated];
    }
  };

  return (
    <View style={[getCardStyle(), style]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  elevated: {
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  flat: {
    backgroundColor: Colors.light.surfaceSecondary,
  },
});
