import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/services/supabase';
import { checkAndUnlockAchievements, DEFAULT_ACHIEVEMENTS } from '@/services/achievementService';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Flame, Zap, Trophy, BookOpen, Lock, Calendar, Star, CheckCircle2 } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { t, language } = useTranslation();
  const { profile, fetchProfile } = useAuthStore();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<Record<string, any>>({});
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadProgressData = async () => {
    try {
      setLoading(true);

      if (profile?.id) {
        // 1. Fetch completed lesson records with xp_reward
        const { data: completedProgress } = await supabase
          .from('user_lesson_progress' as any)
          .select('lesson_id, lessons(xp_reward)')
          .eq('user_id', profile.id)
          .eq('status', 'completed');

        const lessonCountVal = completedProgress?.length || 0;
        setCompletedCount(lessonCountVal);

        const calculatedXpFromLessons = completedProgress?.reduce((sum: number, item: any) => {
          return sum + (item.lessons?.xp_reward || 20);
        }, 0) || 0;

        const effectiveXp = Math.max(profile.xp || 0, calculatedXpFromLessons);
        const effectiveStreak = Math.max(profile.current_streak || 0, lessonCountVal > 0 ? 1 : 0);

        // 2. Check and unlock eligible achievements automatically using effective stats
        await checkAndUnlockAchievements(profile.id, {
          lessonsCompleted: lessonCountVal,
          currentStreak: effectiveStreak,
          totalXp: effectiveXp,
        });

        // 3. Fetch active achievements catalog
        let { data: achData } = await supabase
          .from('achievements' as any)
          .select('*')
          .eq('is_active', true);

        if (!achData || achData.length === 0) {
          achData = DEFAULT_ACHIEVEMENTS as any[];
        }
        setAchievements(achData || []);

        // 4. Fetch user unlocked achievements map
        const { data: userAchData } = await supabase
          .from('user_achievements' as any)
          .select('*')
          .eq('user_id', profile.id);

        if (userAchData) {
          const map: Record<string, any> = {};
          userAchData.forEach((u: any) => {
            if (u.achievement_id) map[u.achievement_id] = u;
          });
          (achData || []).forEach((a: any) => {
            if (a.id && map[a.id] && a.code) {
              map[a.code] = map[a.id];
            }
          });
          setUserAchievements(map);
        }

        // 5. Fetch activity history logs
        const { data: xpLogs } = await supabase
          .from('xp_transactions' as any)
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (xpLogs) setHistoryLogs(xpLogs);
      }
    } catch (err) {
      console.error('Error loading progress data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgressData();
  }, [profile]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      loadProgressData();
    }, [profile?.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    await loadProgressData();
    setRefreshing(false);
  };

  const streak = Math.max(profile?.current_streak ?? 0, completedCount > 0 ? 1 : 0);
  const longestStreak = Math.max(profile?.longest_streak ?? 0, streak);
  const totalXp = profile?.xp ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            {language === 'en' ? 'Progress & Badges' : 'Progresi & Arritjet'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {language === 'en' ? 'Track your achievements and activity' : 'Ndiqni arritjet dhe aktivitetin tuaj'}
          </Text>
        </View>
        <LanguageToggle />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 100, 130) },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.light.primary} />
        }
      >
        {/* 3 Stats Row matching Home Screen */}
        <View style={styles.statsGrid}>
          {/* Streak */}
          <View style={[styles.statCard, { backgroundColor: Colors.light.statOrangeBg }]}>
            <View style={[styles.statIconCircle, { backgroundColor: '#FFEDD5' }]}>
              <Flame size={20} color={Colors.light.statOrangeIcon} fill={Colors.light.statOrangeIcon} />
            </View>
            <Text style={styles.statVal}>{streak}</Text>
            <Text style={styles.statLbl}>{language === 'en' ? 'Day Streak' : 'Ditë Radhazi'}</Text>
            <Text style={styles.statSub}>Max: {longestStreak}</Text>
          </View>

          {/* Total XP */}
          <View style={[styles.statCard, { backgroundColor: Colors.light.statGoldBg }]}>
            <View style={[styles.statIconCircle, { backgroundColor: '#FEF08A' }]}>
              <Zap size={20} color={Colors.light.statGoldIcon} fill={Colors.light.statGoldIcon} />
            </View>
            <Text style={styles.statVal}>{totalXp}</Text>
            <Text style={styles.statLbl}>{language === 'en' ? 'Total XP' : 'XP Gjithsej'}</Text>
            <Text style={styles.statSub}>{language === 'en' ? 'Earned' : 'Fituar'}</Text>
          </View>

          {/* Lessons Completed */}
          <View style={[styles.statCard, { backgroundColor: Colors.light.gridGreenBg }]}>
            <View style={[styles.statIconCircle, { backgroundColor: '#D1FAE5' }]}>
              <BookOpen size={20} color={Colors.light.gridGreenIcon} />
            </View>
            <Text style={styles.statVal}>{completedCount}</Text>
            <Text style={styles.statLbl}>{language === 'en' ? 'Completed' : 'Përfunduar'}</Text>
            <Text style={styles.statSub}>{language === 'en' ? 'Lessons' : 'Mësime'}</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'en' ? 'Achievements & Badges' : 'Arritjet & Medaljet'}
          </Text>
          <View style={styles.achievementsGrid}>
            {achievements.length === 0 ? (
              // Default preview achievement card if DB is empty
              <View style={styles.achCard}>
                <View style={styles.achHeaderRow}>
                  <View style={[styles.achIconCircle, styles.unlockedIconCircle]}>
                    <Trophy size={20} color="#EAB308" />
                  </View>
                  <View style={styles.xpPill}>
                    <Text style={styles.xpPillText}>+50 XP</Text>
                  </View>
                </View>
                <Text style={styles.achTitle}>
                  {language === 'en' ? 'First Steps' : 'Hapat e Parë'}
                </Text>
                <Text style={styles.achDesc}>
                  {language === 'en'
                    ? 'Complete your first German lesson'
                    : 'Përfundo mësimin tënd të parë në gjermanisht'}
                </Text>
              </View>
            ) : (
              achievements.map((ach) => {
                const isUnlocked = !!(ach.id && userAchievements[ach.id]) || !!(ach.code && userAchievements[ach.code]);

                return (
                  <View
                    key={ach.id}
                    style={[styles.achCard, !isUnlocked && styles.lockedAchCard]}
                  >
                    <View style={styles.achHeaderRow}>
                      <View
                        style={[
                          styles.achIconCircle,
                          isUnlocked ? styles.unlockedIconCircle : styles.lockedIconCircle,
                        ]}
                      >
                        {isUnlocked ? (
                          <Trophy size={20} color="#EAB308" />
                        ) : (
                          <Lock size={20} color="#94A3B8" />
                        )}
                      </View>
                      <View style={[styles.xpPill, !isUnlocked && styles.lockedXpPill]}>
                        <Text style={[styles.xpPillText, !isUnlocked && styles.lockedXpPillText]}>
                          +{ach.xp_reward} XP
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.achTitle,
                        !isUnlocked && styles.lockedText,
                      ]}
                    >
                      {ach.title}
                    </Text>
                    {ach.description ? (
                      <Text style={styles.achDesc}>{ach.description}</Text>
                    ) : null}
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* Activity History Log */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'en' ? 'Recent Activity' : 'Aktiviteti i Fundit'}
          </Text>
          {historyLogs.length === 0 ? (
            <View style={styles.emptyCard}>
              <Calendar size={28} color="#94A3B8" style={{ marginBottom: Spacing.xs }} />
              <Text style={styles.emptyText}>
                {language === 'en' ? 'No recent activity recorded yet' : 'Nuk ka ende aktivitete të regjistruara'}
              </Text>
            </View>
          ) : (
            <View style={styles.historyCard}>
              {historyLogs.map((log, index) => (
                <View key={log.id}>
                  <View style={styles.historyRow}>
                    <View style={styles.historyIconCircle}>
                      <Star size={16} color="#1E56E0" fill="#1E56E0" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyDesc}>{log.description || log.source}</Text>
                      <Text style={styles.historyDate}>
                        {new Date(log.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'sq-AL', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <Text style={styles.historyXp}>+{log.amount} XP</Text>
                  </View>
                  {index < historyLogs.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              ))}
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md + 2,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEFF5',
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.xxl,
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs + 1,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.lg,
    gap: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm + 2,
  },
  statCard: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statVal: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.lg,
    color: Colors.light.text,
    lineHeight: 22,
  },
  statLbl: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 11,
    color: Colors.light.text,
    marginTop: 2,
    textAlign: 'center',
  },
  statSub: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 10,
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
  section: {
    gap: Spacing.sm + 2,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    color: Colors.light.text,
  },
  achievementsGrid: {
    gap: Spacing.md,
  },
  achCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  lockedAchCard: {
    backgroundColor: '#F8FAFC',
    opacity: 0.65,
  },
  achHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs + 2,
  },
  achIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedIconCircle: {
    backgroundColor: '#FEF08A',
  },
  lockedIconCircle: {
    backgroundColor: '#E2E8F0',
  },
  xpPill: {
    backgroundColor: '#FEF08A',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  lockedXpPill: {
    backgroundColor: '#E2E8F0',
  },
  xpPillText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 11,
    color: '#D97706',
  },
  lockedXpPillText: {
    color: '#64748B',
  },
  achTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.md,
    color: Colors.light.text,
  },
  lockedText: {
    color: Colors.light.textMuted,
  },
  achDesc: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  historyIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyDesc: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
  },
  historyDate: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  historyXp: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.sm,
    color: '#10B981',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
});
