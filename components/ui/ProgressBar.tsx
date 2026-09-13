import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius } from '@/constants/theme';

interface ProgressBarProps {
  progress: number; // 0 to 1 or 0 to 100
  color?: string;
  backgroundColor?: string;
  height?: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = Colors.light.primary,
  backgroundColor = '#E2E8F0',
  height = 10,
  style,
}) => {
  // Normalize progress to 0..100
  const normalizedProgress = progress > 1 ? Math.min(progress, 100) : Math.max(0, Math.min(progress * 100, 100));

  return (
    <View
      style={[
        styles.container,
        { backgroundColor, height, borderRadius: height / 2 },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${normalizedProgress}%`,
            backgroundColor: color,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
