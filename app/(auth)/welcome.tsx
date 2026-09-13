import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Sparkles, CheckCircle2 } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 24, 36) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header with Brand */}
        <View style={styles.topBar}>
          <View style={styles.brandBadge}>
            <Text style={styles.logoText}>URA</Text>
          </View>
        </View>

        <Text style={styles.tagline}>{t('tagline')}</Text>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconCircle}>
            <Sparkles size={36} color={Colors.light.primary} />
          </View>
          <Text style={styles.heroTitle}>{t('heroTitle')}</Text>
          <Text style={styles.heroSubtitle}>{t('heroSubtitle')}</Text>

          {/* Key Feature Highlights */}
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <CheckCircle2 size={18} color={Colors.light.primary} />
              <Text style={styles.featureText}>{t('feat1')}</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle2 size={18} color={Colors.light.primary} />
              <Text style={styles.featureText}>{t('feat2')}</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle2 size={18} color={Colors.light.primary} />
              <Text style={styles.featureText}>{t('feat3')}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons with Bottom Safety Offset */}
        <View style={styles.actionContainer}>
          <Button
            title={t('startLesson')}
            variant="primary"
            size="lg"
            onPress={() => router.push('/(auth)/register')}
            style={styles.primaryBtn}
          />
          <Button
            title={t('haveAccount')}
            variant="outline"
            size="lg"
            onPress={() => router.push('/(auth)/login')}
            style={styles.secondaryBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  brandBadge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
    elevation: 4,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  logoText: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.xl,
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  tagline: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    marginVertical: Spacing.md,
  },
  heroIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xl,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: 28,
  },
  heroSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  featureList: {
    width: '100%',
    gap: Spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
  },
  actionContainer: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  primaryBtn: {
    width: '100%',
  },
  secondaryBtn: {
    width: '100%',
  },
});
