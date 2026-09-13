import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { Target, Flame, Zap, Award, Check } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

const GOAL_OPTIONS = [
  { id: 'casual', minutes: 5, xp: 20, label: '5 min / day', subtitle: 'Quick refresh', icon: Target },
  { id: 'regular', minutes: 10, xp: 50, label: '10 min / day', subtitle: 'Balanced pace', icon: Flame },
  { id: 'serious', minutes: 15, xp: 100, label: '15 min / day', subtitle: 'Fast progress', icon: Zap },
  { id: 'intense', minutes: 20, xp: 150, label: '20 min / day', subtitle: 'Maximum focus', icon: Award },
];

export default function OnboardingGoalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, fetchProfile } = useAuthStore();
  const { t } = useTranslation();
  const [selectedGoal, setSelectedGoal] = useState('regular');
  const [loading, setLoading] = useState(false);

  const handleSaveGoal = async () => {
    if (!user) {
      router.replace('/(auth)/welcome');
      return;
    }

    try {
      setLoading(true);
      const chosenOption = GOAL_OPTIONS.find((g) => g.id === selectedGoal) || GOAL_OPTIONS[1];

      const { error: prefError } = await supabase.from('user_preferences' as any).upsert({
        user_id: user.id,
        daily_goal_minutes: chosenOption.minutes,
        daily_goal_xp: chosenOption.xp,
        notifications_enabled: true,
        sound_enabled: true,
        haptic_enabled: true,
        preferred_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        app_language: 'sq',
      });

      if (prefError) {
        console.error('Preferences save note:', prefError.message);
      }

      const { error: profileError } = await supabase
        .from('profiles' as any)
        .update({
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update note:', profileError.message);
      }

      await fetchProfile();
      router.replace('/(tabs)');
    } catch (err) {
      console.error('Error completing onboarding:', err);
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 24, 36) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar with Language Toggle */}
        <View style={styles.topBar}>
          <Text style={styles.badgeText}>FINAL STEP</Text>
          <LanguageToggle />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{t('goalTitle')}</Text>
          <Text style={styles.subtitle}>
            Choose how much time you want to spend learning German each day.
          </Text>
        </View>

        <View style={styles.optionsGrid}>
          {GOAL_OPTIONS.map((item) => {
            const isSelected = selectedGoal === item.id;
            const Icon = item.icon;
            const cardStyle: ViewStyle = isSelected
              ? { ...styles.optionCard, ...styles.selectedOptionCard }
              : styles.optionCard;

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelectedGoal(item.id)}
                activeOpacity={0.8}
              >
                <Card
                  style={cardStyle}
                  variant={isSelected ? 'elevated' : 'outlined'}
                >
                  <View style={styles.cardHeaderRow}>
                    <View
                      style={
                        isSelected
                          ? [styles.iconCircle, styles.selectedIconCircle]
                          : styles.iconCircle
                      }
                    >
                      <Icon
                        size={24}
                        color={isSelected ? '#FFFFFF' : Colors.light.primary}
                      />
                    </View>
                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Check size={14} color="#FFFFFF" />
                      </View>
                    )}
                  </View>

                  <Text style={styles.goalLabel}>{item.label}</Text>
                  <Text style={styles.goalSubtitle}>{item.subtitle}</Text>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Button
            title={t('finishBtn')}
            variant="primary"
            size="lg"
            loading={loading}
            onPress={handleSaveGoal}
            style={{ width: '100%' }}
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  header: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  badgeText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xs,
    color: Colors.light.primary,
    letterSpacing: 1.5,
  },
  title: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.xxl,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  optionsGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  optionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  selectedOptionCard: {
    borderColor: Colors.light.primary,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIconCircle: {
    backgroundColor: Colors.light.primary,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    color: Colors.light.text,
    marginBottom: 2,
  },
  goalSubtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  footer: {
    marginTop: 'auto',
  },
});
