import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/services/supabase';
import { Card } from '@/components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Lock, Check, Play, Star, BookOpen, ChevronRight } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

export default function LearnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, language } = useTranslation();
  const { user, profile } = useAuthStore();
  const [levels, setLevels] = useState<any[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [userProgressMap, setUserProgressMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLevelsAndProgress = async () => {
    try {
      setLoading(true);

      // 1. Fetch Levels
      const { data: levelsData } = await supabase
        .from('course_levels' as any)
        .select('*')
        .eq('is_published', true)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true });

      if (levelsData && levelsData.length > 0) {
        setLevels(levelsData);
        if (!selectedLevelId) {
          setSelectedLevelId(levelsData[0].id);
        }
      }

      // 2. Fetch User Lesson Progress
      if (user) {
        const { data: progressData } = await supabase
          .from('user_lesson_progress' as any)
          .select('*')
          .eq('user_id', user.id);

        if (progressData) {
          const map: Record<string, any> = {};
          progressData.forEach((p: any) => {
            map[p.lesson_id] = p;
          });
          setUserProgressMap(map);
        }
      }
    } catch (err) {
      console.error('Error loading learn tree:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadModulesForLevel = async (levelId: string) => {
    try {
      const { data: pathsData } = await supabase
        .from('learning_paths' as any)
        .select(`
          id,
          title,
          description,
          sort_order,
          modules (
            id,
            title,
            description,
            sort_order,
            lessons (
              id,
              title,
              description,
              estimated_minutes,
              xp_reward,
              sort_order,
              is_free
            )
          )
        `)
        .eq('course_level_id', levelId)
        .eq('is_published', true)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true });

      if (pathsData) {
        const allModules: any[] = [];
        pathsData.forEach((path: any) => {
          if (path.modules) {
            path.modules.forEach((mod: any) => {
              if (mod.lessons) {
                mod.lessons.sort((a: any, b: any) => a.sort_order - b.sort_order);
              }
              allModules.push(mod);
            });
          }
        });
        allModules.sort((a, b) => a.sort_order - b.sort_order);
        setModules(allModules);
      }
    } catch (err) {
      console.error('Failed to load level modules:', err);
    }
  };

  useEffect(() => {
    loadLevelsAndProgress();
  }, [user]);

  useEffect(() => {
    if (selectedLevelId) {
      loadModulesForLevel(selectedLevelId);
    }
  }, [selectedLevelId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLevelsAndProgress();
    if (selectedLevelId) await loadModulesForLevel(selectedLevelId);
    setRefreshing(false);
  };

  const checkIsLessonUnlocked = (modIndex: number, lessonIdx: number, lessonId: string): boolean => {
    const currentProgress = userProgressMap[lessonId];
    if (currentProgress?.status === 'completed' || currentProgress?.status === 'in_progress') {
      return true;
    }

    if (modIndex === 0 && lessonIdx === 0) {
      return true;
    }

    if (lessonIdx > 0) {
      const prevLesson = modules[modIndex]?.lessons?.[lessonIdx - 1];
      if (!prevLesson) return false;
      const prevProgress = userProgressMap[prevLesson.id];
      return prevProgress?.status === 'completed';
    }

    if (modIndex > 0 && lessonIdx === 0) {
      const prevModule = modules[modIndex - 1];
      if (!prevModule || !prevModule.lessons || prevModule.lessons.length === 0) return false;
      const lastLessonOfPrevModule = prevModule.lessons[prevModule.lessons.length - 1];
      const prevModuleLastProgress = userProgressMap[lastLessonOfPrevModule.id];
      return prevModuleLastProgress?.status === 'completed';
    }

    return false;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Unified Premium Header */}
      <View style={styles.header}>
        <View style={styles.topNavRow}>
          <View style={styles.headerTextGroup}>
            <Text style={styles.headerTitle}>
              {language === 'en' ? 'Learning Path' : 'Rruga e Mësimit'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {language === 'en' ? 'Master German step-by-step' : 'Përvetëso gjermanishtes hap pas hapi'}
            </Text>
          </View>

          {/* Right Group: User Profile Avatar */}
          <View style={styles.headerRightGroup}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile')}
              activeOpacity={0.8}
              style={styles.avatarWrapper}
            >
              <View style={styles.avatarCircle}>
                <Image
                  source={{ uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop' }}
                  style={styles.avatarImage}
                />
                <View style={styles.onlineBadge} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Integrated Segmented Level Selector Track */}
        <View style={styles.levelSelectorTrack}>
          {levels.map((lvl) => {
            const isSelected = selectedLevelId === lvl.id;
            return (
              <TouchableOpacity
                key={lvl.id}
                style={[
                  styles.levelPill,
                  isSelected && styles.selectedLevelPill,
                ]}
                onPress={() => setSelectedLevelId(lvl.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.levelPillText,
                    isSelected && styles.selectedLevelPillText,
                  ]}
                >
                  {lvl.code || lvl.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Main Content */}
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
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        ) : modules.length === 0 ? (
          <Card style={styles.emptyCard}>
            <BookOpen size={36} color={Colors.light.textMuted} style={{ marginBottom: Spacing.sm }} />
            <Text style={styles.emptyTitle}>
              {language === 'en' ? 'No lessons in this level yet' : 'Nuk ka mësime në këtë nivel ende'}
            </Text>
            <Text style={styles.emptySub}>
              {language === 'en' ? 'Check back soon for new modules!' : 'Kthehuni përsëri së shpejti për module të reja!'}
            </Text>
          </Card>
        ) : (
          modules.map((module, modIndex) => (
            <View key={module.id} style={styles.moduleSection}>
              {/* Module Linear Gradient Banner */}
              <LinearGradient
                colors={['#1E56E0', '#0284C7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.moduleBanner}
              >
                <Text style={styles.moduleIndexText}>
                  {language === 'en' ? 'MODULE' : 'MODULI'} {modIndex + 1}
                </Text>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                {module.description ? (
                  <Text style={styles.moduleDesc}>{module.description}</Text>
                ) : null}
              </LinearGradient>

              {/* Vertical Path Nodes */}
              <View style={styles.pathNodeContainer}>
                {module.lessons?.map((lesson: any, lessonIdx: number) => {
                  const progress = userProgressMap[lesson.id];
                  const isCompleted = progress?.status === 'completed';
                  const isUnlocked = checkIsLessonUnlocked(modIndex, lessonIdx, lesson.id);

                  return (
                    <View key={lesson.id} style={styles.nodeRow}>
                      {/* Interactive Path Circle Node */}
                      <TouchableOpacity
                        style={[
                          styles.nodeCircle,
                          isCompleted
                            ? styles.completedNodeCircle
                            : isUnlocked
                            ? styles.activeNodeCircle
                            : styles.lockedNodeCircle,
                        ]}
                        disabled={!isUnlocked}
                        onPress={() => router.push(`/lesson/${lesson.id}`)}
                        activeOpacity={0.8}
                      >
                        {isCompleted ? (
                          <Check size={24} color="#FFFFFF" strokeWidth={3} />
                        ) : isUnlocked ? (
                          <Play size={20} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
                        ) : (
                          <Lock size={20} color="#94A3B8" />
                        )}
                      </TouchableOpacity>

                      {/* Lesson Details Card */}
                      <TouchableOpacity
                        style={{ flex: 1 }}
                        disabled={!isUnlocked}
                        onPress={() => router.push(`/lesson/${lesson.id}`)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.lessonCardNode, !isUnlocked && styles.lockedLessonCard]}>
                          <View style={styles.lessonMetaRow}>
                            <Text style={styles.lessonOrderText}>
                              {language === 'en' ? 'Lesson' : 'Mësimi'} {lessonIdx + 1}
                            </Text>
                            <View style={styles.xpBadge}>
                              <Star size={13} color="#EAB308" fill="#EAB308" />
                              <Text style={styles.xpBadgeText}>+{lesson.xp_reward || 20} XP</Text>
                            </View>
                          </View>

                          <Text
                            style={[
                              styles.nodeLessonTitle,
                              !isUnlocked && styles.lockedText,
                            ]}
                          >
                            {lesson.title}
                          </Text>

                          <View style={styles.lessonBottomRow}>
                            <Text style={styles.lessonTimeText}>
                              {lesson.estimated_minutes || 5} min • {lesson.is_free ? (language === 'en' ? 'Free' : 'Falas') : 'Premium'}
                            </Text>
                            {isUnlocked ? (
                              <ChevronRight size={16} color="#1E56E0" />
                            ) : null}
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.md + 2,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md - 2,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEFF5',
    gap: Spacing.md - 2,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextGroup: {
    flex: 1,
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
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarWrapper: {
    marginLeft: 4,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  levelSelectorTrack: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.full,
    padding: 3,
    alignItems: 'center',
  },
  levelPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedLevelPill: {
    backgroundColor: '#1E56E0',
    shadowColor: '#1E56E0',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  levelPillText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xs + 1,
    color: '#64748B',
  },
  selectedLevelPillText: {
    color: '#FFFFFF',
    fontFamily: Typography.fontFamily.extraBold,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.lg,
    gap: Spacing.xl,
  },
  loaderContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
  },
  emptyTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.md,
    color: Colors.light.text,
  },
  emptySub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  moduleSection: {
    marginBottom: Spacing.sm,
  },
  moduleBanner: {
    borderRadius: 20,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#1E56E0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  moduleIndexText: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 1.2,
  },
  moduleTitle: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.lg + 1,
    color: '#FFFFFF',
    marginTop: 2,
  },
  moduleDesc: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },
  pathNodeContainer: {
    gap: Spacing.md,
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  nodeCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  completedNodeCircle: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOpacity: 0.25,
  },
  activeNodeCircle: {
    backgroundColor: '#1E56E0',
    shadowColor: '#1E56E0',
    shadowOpacity: 0.3,
  },
  lockedNodeCircle: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  lessonCardNode: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  lockedLessonCard: {
    backgroundColor: '#F8FAFC',
    opacity: 0.65,
  },
  lessonMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  lessonOrderText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpBadgeText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xs,
    color: '#EAB308',
  },
  nodeLessonTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.md - 1,
    color: Colors.light.text,
  },
  lockedText: {
    color: Colors.light.textMuted,
  },
  lessonBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  lessonTimeText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
});
