import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/services/supabase';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import {
  Flame,
  Star,
  Target,
  BookOpen,
  Brain,
  Trophy,
  BarChart2,
  Play,
  ChevronRight,
  CheckCircle2,
  MessageCircle,
  Hash,
} from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, language } = useTranslation();
  const { user, profile, preferences, fetchProfile } = useAuthStore();

  const [refreshing, setRefreshing] = useState(false);
  const [nextLesson, setNextLesson] = useState<any>(null);
  const [loadingLesson, setLoadingLesson] = useState(true);

  // Live module & goal statistics
  const [moduleLessonStats, setModuleLessonStats] = useState<{
    lessonIndex: number;
    totalLessons: number;
    completedCount: number;
  }>({ lessonIndex: 1, totalLessons: 5, completedCount: 0 });
  const [todayCompletedLessons, setTodayCompletedLessons] = useState<number>(0);
  const [recentCompletedLessons, setRecentCompletedLessons] = useState<any[]>([]);

  // Fetch real live dashboard data from Supabase DB
  const fetchHomeDashboardData = async () => {
    try {
      setLoadingLesson(true);

      let completedLessonIds = new Set<string>();
      let completedMap: Record<string, any> = {};

      if (user) {
        // Check if streak broke (no activity yesterday or today)
        if (profile?.last_activity_at && profile.current_streak > 0) {
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          const lastActStr = new Date(profile.last_activity_at).toISOString().split('T')[0];
          if (lastActStr !== todayStr && lastActStr !== yesterdayStr) {
            // Reset streak to 0 in DB
            await supabase
              .from('profiles' as any)
              .update({ current_streak: 0 })
              .eq('id', user.id);
            fetchProfile();
          }
        }

        // 1. Fetch user progress records
        const { data: progressData } = await supabase
          .from('user_lesson_progress' as any)
          .select('*')
          .eq('user_id', user.id);

        if (progressData) {
          progressData.forEach((p: any) => {
            completedMap[p.lesson_id] = p;
            if (p.status === 'completed') {
              completedLessonIds.add(p.lesson_id);
            }
          });
        }

        // 2. Today's completed lessons count
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const { count: todayCount } = await supabase
          .from('user_lesson_progress' as any)
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('completed_at', todayStart.toISOString());

        setTodayCompletedLessons(todayCount || 0);

        // 3. Fetch top 3 recent completed lessons ordered by completed_at descending
        const { data: recentProgress } = await supabase
          .from('user_lesson_progress' as any)
          .select(`
            completed_at,
            lessons (
              id,
              title,
              xp_reward,
              modules (
                sort_order,
                learning_paths (
                  course_levels (
                    code
                  )
                )
              )
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(3);

        if (recentProgress && recentProgress.length > 0) {
          const recentLessonsList = recentProgress
            .map((rp: any) => rp.lessons)
            .filter(Boolean);
          setRecentCompletedLessons(recentLessonsList);
        } else {
          setRecentCompletedLessons([]);
        }
      }

      // 4. Fetch full structured curriculum to identify the exact active uncompleted lesson
      const { data: levelsData } = await supabase
        .from('course_levels' as any)
        .select('*')
        .eq('is_published', true)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true });

      if (levelsData && levelsData.length > 0) {
        const firstLevel = levelsData[0];

        const { data: pathsData } = await supabase
          .from('learning_paths' as any)
          .select(`
            id,
            title,
            sort_order,
            modules (
              id,
              title,
              sort_order,
              lessons (
                id,
                title,
                description,
                estimated_minutes,
                xp_reward,
                sort_order,
                is_free,
                is_published
              )
            )
          `)
          .eq('course_level_id', firstLevel.id)
          .eq('is_published', true)
          .is('deleted_at', null)
          .order('sort_order', { ascending: true });

        if (pathsData) {
          const orderedModules: any[] = [];
          pathsData.forEach((p: any) => {
            if (p.modules) {
              p.modules.forEach((mod: any) => {
                if (mod.lessons) {
                  mod.lessons = mod.lessons
                    .filter((l: any) => l.is_published)
                    .sort((a: any, b: any) => a.sort_order - b.sort_order);
                }
                orderedModules.push(mod);
              });
            }
          });
          orderedModules.sort((a, b) => a.sort_order - b.sort_order);

          let activeLessonObj: any = null;
          let activeMod: any = null;
          let lessonIdxInMod = 0;

          for (const mod of orderedModules) {
            if (mod.lessons && mod.lessons.length > 0) {
              const uncompletedIdx = mod.lessons.findIndex(
                (l: any) => !completedLessonIds.has(l.id)
              );
              if (uncompletedIdx !== -1) {
                activeLessonObj = mod.lessons[uncompletedIdx];
                activeMod = mod;
                lessonIdxInMod = uncompletedIdx;
                break;
              }
            }
          }

          if (!activeLessonObj && orderedModules.length > 0) {
            activeMod = orderedModules[orderedModules.length - 1];
            if (activeMod?.lessons?.length > 0) {
              activeLessonObj = activeMod.lessons[activeMod.lessons.length - 1];
              lessonIdxInMod = activeMod.lessons.length - 1;
            }
          }

          if (activeLessonObj && activeMod) {
            const enrichedLesson = {
              ...activeLessonObj,
              module_id: activeMod.id,
              modules: {
                id: activeMod.id,
                title: activeMod.title,
                sort_order: activeMod.sort_order,
                learning_paths: {
                  course_levels: {
                    code: firstLevel.code || 'A1',
                    title: firstLevel.title || 'Gjermanisht',
                  },
                },
              },
            };

            setNextLesson(enrichedLesson);

            const totalLessonsInMod = activeMod.lessons.length;
            const completedInMod = activeMod.lessons.filter((l: any) =>
              completedLessonIds.has(l.id)
            ).length;

            setModuleLessonStats({
              lessonIndex: lessonIdxInMod + 1,
              totalLessons: totalLessonsInMod,
              completedCount: completedInMod,
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoadingLesson(false);
    }
  };

  useEffect(() => {
    fetchHomeDashboardData();
  }, [user, profile]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      fetchHomeDashboardData();
    }, [user])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfile();
    await fetchHomeDashboardData();
    setRefreshing(false);
  }, []);

  // Time-based greeting in Albanian / English
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (language === 'en') {
      if (hour < 12) return 'Good morning!';
      if (hour < 18) return 'Good afternoon!';
      return 'Good evening!';
    }
    if (hour < 12) return 'Mirëmëngjes!';
    if (hour < 18) return 'Mirëdita!';
    return 'Mirëmbrëma!';
  };

  // Real database values from Supabase profile and preferences
  const streak = profile?.current_streak ?? 0;
  const xp = profile?.xp ?? 0;
  const targetDailyGoalLessons = preferences?.daily_goal_xp
    ? Math.max(1, Math.ceil(preferences.daily_goal_xp / 20))
    : 3;
  const dailyGoalRatioText = `${todayCompletedLessons}/${targetDailyGoalLessons}`;
  const dailyGoalPercent = Math.min((todayCompletedLessons / targetDailyGoalLessons) * 100, 100);

  // Hero Banner computed values
  const courseLevelCode = nextLesson?.modules?.learning_paths?.course_levels?.code || 'A1';
  const courseLevelTitle = nextLesson?.modules?.learning_paths?.course_levels?.title || 'Gjermanisht';
  const moduleTitle = nextLesson?.modules?.title || 'Jeta e përditshme';
  const moduleOrder = nextLesson?.modules?.sort_order || 1;
  const lessonStepText =
    language === 'en'
      ? `Lesson ${moduleLessonStats.lessonIndex} of ${moduleLessonStats.totalLessons}`
      : `Mësimi ${moduleLessonStats.lessonIndex} nga ${moduleLessonStats.totalLessons}`;

  const moduleProgressPercent = Math.round(
    (moduleLessonStats.completedCount / moduleLessonStats.totalLessons) * 100
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header matching Profile screen navbar */}
      <View style={styles.header}>
        <View style={styles.headerTextGroup}>
          <View style={styles.greetingRow}>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
            <Text style={styles.wavingEmoji}> 👋</Text>
          </View>
          <Text style={styles.subGreetingText}>
            {language === 'en' ? 'Ready to learn German today?' : 'Gati për të mësuar gjermanisht sot?'}
          </Text>
        </View>

        {/* User Profile Avatar with Active Dot */}
        <View style={styles.headerRightGroup}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.8}
            style={styles.avatarWrapper}
          >
            <View style={styles.avatarCircle}>
              <Image
                source={{
                  uri:
                    profile?.avatar_url ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
                }}
                style={styles.avatarImage}
              />
              <View style={styles.onlineBadge} />
            </View>
          </TouchableOpacity>
        </View>
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
        {/* 3-Card Stat Row with Live Data */}
        <View style={styles.statRow}>
          {/* Real Streak Card */}
          <View style={[styles.statCard, { backgroundColor: Colors.light.statOrangeBg }]}>
            <View style={[styles.statIconCircle, { backgroundColor: '#FFEDD5' }]}>
              <Flame size={20} color={Colors.light.statOrangeIcon} fill={Colors.light.statOrangeIcon} />
            </View>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>{language === 'en' ? 'Day streak' : 'Ditë radhazi'}</Text>
          </View>

          {/* Real XP Card */}
          <View style={[styles.statCard, { backgroundColor: Colors.light.statGoldBg }]}>
            <View style={[styles.statIconCircle, { backgroundColor: '#FEF08A' }]}>
              <Star size={20} color={Colors.light.statGoldIcon} fill={Colors.light.statGoldIcon} />
            </View>
            <Text style={styles.statValue}>{xp}</Text>
            <Text style={styles.statLabel}>{language === 'en' ? 'Total XP' : 'XP gjithsej'}</Text>
          </View>

          {/* Real Daily Goal Card */}
          <View style={[styles.statCard, { backgroundColor: Colors.light.statRedBg }]}>
            <View style={[styles.statIconCircle, { backgroundColor: '#FEE2E2' }]}>
              <Target size={20} color={Colors.light.statRedIcon} />
            </View>
            <Text style={styles.statValue}>{dailyGoalRatioText}</Text>
            <Text style={styles.statLabel}>{language === 'en' ? 'Daily goal' : 'Qëllimi ditor'}</Text>
          </View>
        </View>

        {/* Continue Learning Vivid Blue Hero Banner */}
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => {
            if (nextLesson?.id) {
              router.push(`/lesson/${nextLesson.id}`);
            } else {
              router.push('/(tabs)/learn');
            }
          }}
        >
          <LinearGradient
            colors={['#1E56E0', '#0284C7', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            {/* Background Architectural Artwork SVG Overlay */}
            <View style={styles.heroBgArt}>
              <Svg height="160" width="180" viewBox="0 0 180 160">
                <G opacity="0.22" fill="#FFFFFF">
                  <Rect x="20" y="70" width="140" height="12" rx="4" />
                  <Rect x="30" y="35" width="120" height="8" rx="2" />
                  <Rect x="40" y="25" width="100" height="6" rx="2" />
                  <Rect x="32" y="82" width="12" height="60" rx="3" />
                  <Rect x="54" y="82" width="12" height="60" rx="3" />
                  <Rect x="76" y="82" width="12" height="60" rx="3" />
                  <Rect x="98" y="82" width="12" height="60" rx="3" />
                  <Rect x="120" y="82" width="12" height="60" rx="3" />
                  <Rect x="142" y="82" width="12" height="60" rx="3" />
                  <Rect x="20" y="142" width="140" height="10" rx="3" />
                </G>
              </Svg>
            </View>

            {/* Handwritten German Quote Annotation */}
            <View style={styles.quoteBadge}>
              <Text style={styles.quoteText}>Schritt für Schritt</Text>
              <Text style={styles.quoteSubText}>eine bessere Zukunft ♡</Text>
            </View>

            {/* Hero Left Content */}
            <View style={styles.heroContentLeft}>
              <Text style={styles.heroTag}>VAZHDO TË MËSOSH</Text>

              <Text style={styles.heroCourseTitle}>
                {courseLevelCode} – {courseLevelTitle}
              </Text>
              <Text style={styles.heroModuleSubtitle}>
                {language === 'en' ? 'Module' : 'Moduli'} {moduleOrder} · {moduleTitle}
              </Text>

              <Text style={styles.heroLessonStep}>{lessonStepText}</Text>
              <Text style={styles.heroLessonTitle}>{nextLesson?.title || 'Përshëndetje dhe prezantimi'}</Text>

              {/* Live Module Progress Bar & Percentage */}
              <View style={styles.heroProgressRow}>
                <View style={styles.heroTrack}>
                  <View style={[styles.heroFill, { width: `${moduleProgressPercent}%` }]} />
                </View>
                <Text style={styles.heroPercentText}>{moduleProgressPercent}%</Text>
              </View>

              {/* White CTA Pill Button */}
              <TouchableOpacity
                style={styles.heroCtaButton}
                activeOpacity={0.85}
                onPress={() => {
                  if (nextLesson?.id) {
                    router.push(`/lesson/${nextLesson.id}`);
                  } else {
                    router.push('/(tabs)/learn');
                  }
                }}
              >
                <View style={styles.heroCtaIconCircle}>
                  <Play size={12} color="#1E56E0" fill="#1E56E0" style={{ marginLeft: 1 }} />
                </View>
                <Text style={styles.heroCtaText}>
                  {language === 'en' ? 'Continue lesson' : 'Vazhdo mësimin'}
                </Text>
                <ChevronRight size={16} color="#1E56E0" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* 4-Column Quick Action Grid */}
        <View style={styles.quickGrid}>
          {/* 1. Mësimet (Lessons) */}
          <TouchableOpacity
            style={[styles.gridItemCard, { backgroundColor: Colors.light.gridGreenBg }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/learn')}
          >
            <View style={[styles.gridIconBadge, { backgroundColor: '#D1FAE5' }]}>
              <BookOpen size={20} color={Colors.light.gridGreenIcon} />
            </View>
            <Text style={styles.gridItemTitle}>{language === 'en' ? 'Lessons' : 'Mësimet'}</Text>
            <Text style={styles.gridItemSub}>{language === 'en' ? 'Continue path' : 'Vazhdo rrugën'}</Text>
          </TouchableOpacity>

          {/* 2. Rishikim (Review) */}
          <TouchableOpacity
            style={[styles.gridItemCard, { backgroundColor: Colors.light.gridPurpleBg }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/review')}
          >
            <View style={[styles.gridIconBadge, { backgroundColor: '#EDE9FE' }]}>
              <Brain size={20} color={Colors.light.gridPurpleIcon} />
            </View>
            <Text style={styles.gridItemTitle}>{language === 'en' ? 'Review' : 'Rishikim'}</Text>
            <Text style={styles.gridItemSub}>{language === 'en' ? 'Strengthen' : 'Forco njohuritë'}</Text>
          </TouchableOpacity>

          {/* 3. Arritjet (Achievements) */}
          <TouchableOpacity
            style={[styles.gridItemCard, { backgroundColor: Colors.light.gridGoldBg }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/progress')}
          >
            <View style={[styles.gridIconBadge, { backgroundColor: '#FEF08A' }]}>
              <Trophy size={20} color={Colors.light.gridGoldIcon} />
            </View>
            <Text style={styles.gridItemTitle}>{language === 'en' ? 'Badges' : 'Arritjet'}</Text>
            <Text style={styles.gridItemSub}>{language === 'en' ? 'View progress' : 'Shiko progresin'}</Text>
          </TouchableOpacity>

          {/* 4. Progresi (Progress) */}
          <TouchableOpacity
            style={[styles.gridItemCard, { backgroundColor: Colors.light.gridRedBg }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/progress')}
          >
            <View style={[styles.gridIconBadge, { backgroundColor: '#FEE2E2' }]}>
              <BarChart2 size={20} color={Colors.light.gridRedIcon} />
            </View>
            <Text style={styles.gridItemTitle}>{language === 'en' ? 'Progress' : 'Progresi'}</Text>
            <Text style={styles.gridItemSub}>{language === 'en' ? 'Statistics' : 'Shiko statistikat'}</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Goal Mascot Banner Card with Live Data */}
        <View style={styles.dailyGoalBanner}>
          <View style={styles.dailyGoalLeftIcon}>
            <View style={styles.targetIconCircle}>
              <Target size={24} color="#EA580C" />
            </View>
          </View>

          <View style={styles.dailyGoalCenter}>
            <Text style={styles.dailyGoalTitle}>
              {language === 'en' ? "Today's Goal" : 'Qëllimi i sotëm'}
            </Text>
            <Text style={styles.dailyGoalDesc}>
              {todayCompletedLessons >= targetDailyGoalLessons
                ? (language === 'en'
                    ? 'Goal achieved! Keep up the great momentum.'
                    : 'Qëllimi u arrit! Vazhdo me të njëjtin ritëm.')
                : (language === 'en'
                    ? `Complete ${Math.max(1, targetDailyGoalLessons - todayCompletedLessons)} more lessons to reach your daily goal!`
                    : `Përfundo edhe ${Math.max(1, targetDailyGoalLessons - todayCompletedLessons)} mësime për të arritur qëllimin tënd ditor!`)}
            </Text>

            {/* Goal Progress Bar */}
            <View style={styles.dailyGoalProgressTrack}>
              <View style={[styles.dailyGoalProgressFill, { width: `${dailyGoalPercent}%` }]} />
            </View>
          </View>

          {/* Right Mascot + Ratio */}
          <View style={styles.dailyGoalRight}>
            {/* Speech Bubble */}
            <View style={styles.speechBubble}>
              <Text style={styles.speechBubbleText}>
                {todayCompletedLessons >= targetDailyGoalLessons ? 'Të lumtë!' : 'Ti mundesh!'}
              </Text>
            </View>

            {/* Owl Mascot Illustration */}
            <Svg height="56" width="56" viewBox="0 0 100 100">
              <Path d="M25 35 L35 15 L45 30 Z" fill="#B45309" />
              <Path d="M75 35 L65 15 L55 30 Z" fill="#B45309" />
              <Circle cx="50" cy="55" r="35" fill="#D97706" />
              <Circle cx="50" cy="58" r="24" fill="#FEF3C7" />
              <Circle cx="38" cy="48" r="11" fill="#FFFFFF" />
              <Circle cx="62" cy="48" r="11" fill="#FFFFFF" />
              <Circle cx="40" cy="48" r="5" fill="#1E293B" />
              <Circle cx="60" cy="48" r="5" fill="#1E293B" />
              <Path d="M46 54 L54 54 L50 62 Z" fill="#F59E0B" />
              <Path d="M18 55 Q 5 45 12 35 Q 22 45 22 55 Z" fill="#B45309" />
              <Path d="M82 55 Q 95 45 88 35 Q 78 45 78 55 Z" fill="#B45309" />
            </Svg>

            <Text style={styles.dailyGoalRatioText}>{dailyGoalRatioText}</Text>
          </View>
        </View>

        {/* Recent Lessons Section ("Mësimet e fundit") */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>
              {language === 'en' ? 'Recent Lessons' : 'Mësimet e fundit'}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/learn')} activeOpacity={0.7}>
              <Text style={styles.seeAllText}>
                {language === 'en' ? 'See all' : 'Shiko të gjitha'}{' >'}
              </Text>
            </TouchableOpacity>
          </View>

          {recentCompletedLessons.length > 0 ? (
            recentCompletedLessons.map((item: any, idx: number) => (
              <TouchableOpacity
                key={item.id}
                style={styles.recentCard}
                activeOpacity={0.8}
                onPress={() => router.push(`/lesson/${item.id}`)}
              >
                <View
                  style={[
                    styles.recentIconBox,
                    { backgroundColor: idx % 2 === 0 ? '#E0F2FE' : '#FCE7F3' },
                  ]}
                >
                  {idx % 2 === 0 ? (
                    <MessageCircle size={22} color="#0284C7" />
                  ) : (
                    <Hash size={22} color="#DB2777" />
                  )}
                </View>

                <View style={styles.recentInfo}>
                  <Text style={styles.recentItemTitle}>{item.title}</Text>
                  <Text style={styles.recentItemSub}>
                    {item.modules?.learning_paths?.course_levels?.code || 'A1'} · Moduli {item.modules?.sort_order || 1}
                  </Text>
                </View>

                <View style={styles.recentBadge}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <Text style={styles.recentBadgeText}>
                    {language === 'en' ? 'Completed' : 'Përfunduar'}
                  </Text>
                  <ChevronRight size={16} color="#94A3B8" style={{ marginLeft: 2 }} />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <TouchableOpacity
              style={styles.recentCard}
              activeOpacity={0.8}
              onPress={() => {
                if (nextLesson?.id) router.push(`/lesson/${nextLesson.id}`);
                else router.push('/(tabs)/learn');
              }}
            >
              <View style={[styles.recentIconBox, { backgroundColor: '#E0F2FE' }]}>
                <MessageCircle size={22} color="#0284C7" />
              </View>

              <View style={styles.recentInfo}>
                <Text style={styles.recentItemTitle}>
                  {nextLesson?.title || (language === 'en' ? 'Start Lesson 1' : 'Fillo Mësimin 1')}
                </Text>
                <Text style={styles.recentItemSub}>
                  {courseLevelCode} · Moduli {moduleOrder}
                </Text>
              </View>

              <View style={styles.recentBadge}>
                <Play size={14} color="#1E56E0" fill="#1E56E0" />
                <Text style={[styles.recentBadgeText, { color: '#1E56E0' }]}>
                  {language === 'en' ? 'Start' : 'Fillo'}
                </Text>
                <ChevronRight size={16} color="#94A3B8" style={{ marginLeft: 2 }} />
              </View>
            </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.lg,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md + 2,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEFF5',
  },
  headerTextGroup: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.xxl + 2,
    color: Colors.light.text,
  },
  wavingEmoji: {
    fontSize: Typography.fontSize.xxl,
  },
  subGreetingText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
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

  /* 3-Card Stat Row */
  statRow: {
    flexDirection: 'row',
    gap: Spacing.sm + 2,
  },
  statCard: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
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
  statValue: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.lg,
    color: Colors.light.text,
    lineHeight: 22,
  },
  statLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },

  /* Hero Banner */
  heroCard: {
    borderRadius: 24,
    padding: Spacing.lg + 2,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#1E56E0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  heroBgArt: {
    position: 'absolute',
    right: -20,
    bottom: -10,
  },
  quoteBadge: {
    position: 'absolute',
    top: 20,
    right: 18,
    alignItems: 'flex-end',
  },
  quoteText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 12,
    color: '#E0F2FE',
    fontStyle: 'italic',
  },
  quoteSubText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: 11,
    color: '#BAE6FD',
    fontStyle: 'italic',
  },
  heroContentLeft: {
    width: '78%',
  },
  heroTag: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  heroCourseTitle: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.xxl,
    color: '#FFFFFF',
    lineHeight: 30,
  },
  heroModuleSubtitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs + 1,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: Spacing.md,
  },
  heroLessonStep: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs,
    color: '#93C5FD',
  },
  heroLessonTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.md + 1,
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
  },
  heroProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg - 2,
  },
  heroTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
  },
  heroFill: {
    height: '100%',
    backgroundColor: Colors.light.limeProgress,
    borderRadius: 4,
  },
  heroPercentText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  heroCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md + 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  heroCtaIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCtaText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.sm,
    color: '#1E56E0',
  },

  /* 4-Grid Quick Actions */
  quickGrid: {
    flexDirection: 'row',
    gap: Spacing.sm + 2,
  },
  gridItemCard: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridItemTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.sm - 1,
    color: Colors.light.text,
    textAlign: 'center',
  },
  gridItemSub: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 10,
    color: Colors.light.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },

  /* Daily Goal Banner */
  dailyGoalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.dailyGoalBg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md + 2,
    borderWidth: 1,
    borderColor: Colors.light.dailyGoalBorder,
  },
  dailyGoalLeftIcon: {
    marginRight: Spacing.sm + 2,
  },
  targetIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
  },
  dailyGoalCenter: {
    flex: 1,
  },
  dailyGoalTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.md,
    color: Colors.light.text,
  },
  dailyGoalDesc: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  dailyGoalProgressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FEF3C7',
    marginTop: 8,
    overflow: 'hidden',
  },
  dailyGoalProgressFill: {
    height: '100%',
    backgroundColor: Colors.light.dailyGoalProgress,
    borderRadius: 4,
  },
  dailyGoalRight: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
  speechBubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: -4,
    zIndex: 2,
  },
  speechBubbleText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 9,
    color: '#D97706',
  },
  dailyGoalRatioText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
    marginTop: 2,
  },

  /* Recent Lessons */
  recentSection: {
    gap: Spacing.sm,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  recentTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    color: Colors.light.text,
  },
  seeAllText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xs + 1,
    color: Colors.light.textSecondary,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  recentIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 2,
  },
  recentInfo: {
    flex: 1,
  },
  recentItemTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.sm + 1,
    color: Colors.light.text,
  },
  recentItemSub: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  recentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentBadgeText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 11,
    color: '#10B981',
  },
});
