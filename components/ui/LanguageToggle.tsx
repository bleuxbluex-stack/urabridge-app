import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { Colors, Typography, BorderRadius, Spacing } from '@/constants/theme';
import { Globe } from 'lucide-react-native';

interface LanguageToggleProps {
  style?: object;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ style }) => {
  const { language, toggleLanguage } = useTranslation();

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={toggleLanguage}
      activeOpacity={0.8}
    >
      <View style={styles.iconCircle}>
        <Globe size={14} color={Colors.light.primary} />
      </View>
      <Text style={styles.text}>
        {language === 'sq' ? '🇦🇱 SQ' : '🇬🇧 EN'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.light.primary + '25',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: 12,
    color: Colors.light.primary,
    letterSpacing: 0.5,
  },
});
