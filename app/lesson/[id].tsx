import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/services/supabase';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { MultipleChoiceExercise } from '@/features/exercises/MultipleChoiceExercise';
import { TranslationExercise } from '@/features/exercises/TranslationExercise';
import { FillBlankExercise } from '@/features/exercises/FillBlankExercise';
import { SentenceOrderingExercise } from '@/features/exercises/SentenceOrderingExercise';
import { VocabularyExercise } from '@/features/exercises/VocabularyExercise';
import { PronunciationExercise } from '@/features/exercises/PronunciationExercise';
import { X, CheckCircle2, XCircle, Award, Star } from 'lucide-react-native';
import { useTranslation } from '@/hooks/useTranslation';
import * as Haptics from 'expo-haptics';
import { playCorrectSound, playIncorrectSound } from '@/services/audio';

export default function LessonPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, language } = useTranslation();
  const { user, profile, fetchProfile } = useAuthStore();

  const [lesson, setLesson] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // User input states
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [speechResult, setSpeechResult] = useState<{
    text: string;
    accuracy: number;
    passed: boolean;
  } | null>(null);

  // Feedback states
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);

  // Lesson summary metrics
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (id) {
      loadLessonData(id);
    }
  }, [id]);

  const loadLessonData = async (lessonId: string) => {
    try {
      setLoading(true);

      const { data: lessonData } = await supabase
        .from('lessons' as any)
        .select('*')
        .eq('id', lessonId)
        .single();

      if (lessonData) {
        setLesson(lessonData);
      }

      const { data: exercisesData } = await supabase
        .from('exercises' as any)
        .select(`
          *,
          exercise_options (*)
        `)
        .eq('lesson_id', lessonId)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true });

      if (exercisesData && exercisesData.length > 0) {
        const formatted = exercisesData.map((ex: any) => {
          if (ex.exercise_options) {
            ex.exercise_options.sort((a: any, b: any) => a.sort_order - b.sort_order);
          }
          return ex;
        });
        setExercises(formatted);
        prepareExerciseWords(formatted[0]);
      }
    } catch (err) {
      console.error('Error loading lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const prepareExerciseWords = (ex: any) => {
    if (ex && (ex.exercise_type === 'sentence_ordering' || ex.exercise_type === 'sentence_order')) {
      const target = ex.correct_answer || '';
      const words = target.split(' ').filter(Boolean);
      // Simple deterministic pseudo-shuffle
      const shuffled = [...words].sort((a, b) => a.length - b.length);
      setShuffledWords(shuffled);
    }
  };

  const currentExercise = exercises[currentIndex];
  const totalExercises = exercises.length;
  const progressPercent = totalExercises > 0 ? (currentIndex / totalExercises) * 100 : 0;

  const handleSubmitAnswer = async () => {
    if (!currentExercise) return;

    let correct = false;
    let givenAnswer = '';

    const exType = currentExercise.exercise_type;
    const hasOptions = currentExercise.exercise_options && currentExercise.exercise_options.length > 0;

    if (exType === 'multiple_choice' || exType === 'word_selection' || (exType === 'fill_blank' && hasOptions)) {
      const selected = currentExercise.exercise_options?.find((o: any) => o.id === selectedOptionId);
      correct = selected?.is_correct ?? false;
      givenAnswer = selected?.option_text || '';
    } else if (exType === 'translation' || (exType === 'fill_blank' && !hasOptions)) {
      const target = (currentExercise.correct_answer || '').trim().toLowerCase();
      const userClean = textAnswer.trim().toLowerCase();
      correct = userClean === target || target.includes(userClean);
      givenAnswer = textAnswer;
    } else if (exType === 'sentence_ordering' || exType === 'sentence_order') {
      const formedSentence = selectedWords.join(' ').trim().toLowerCase();
      const targetSentence = (currentExercise.correct_answer || '').trim().toLowerCase();
      correct = formedSentence === targetSentence;
      givenAnswer = selectedWords.join(' ');
    } else if (exType === 'vocabulary') {
      correct = true;
    } else if (exType === 'pronunciation' || exType === 'speaking') {
      correct = speechResult ? speechResult.passed : true;
      givenAnswer = speechResult?.text || currentExercise.question || '';
    }

    setIsCorrect(correct);
    setExplanation(currentExercise.explanation);
    setHasSubmitted(true);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
      playCorrectSound();
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {}
    } else {
      playIncorrectSound();
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (_) {}
    }

    if (user) {
      await supabase.from('exercise_attempts' as any).insert({
        user_id: user.id,
        exercise_id: currentExercise.id,
        lesson_id: lesson?.id,
        answer: givenAnswer,
        is_correct: correct,
        score: correct ? currentExercise.points || 10 : 0,
      });

      await supabase.from('user_exercise_progress' as any).upsert(
        {
          user_id: user.id,
          exercise_id: currentExercise.id,
          is_completed: true,
          best_score: correct ? currentExercise.points || 10 : 0,
          attempt_count: 1,
          last_attempt_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,exercise_id' }
      );
    }
  };

  const handleNext = () => {
    setSelectedOptionId(null);
    setTextAnswer('');
    setSelectedWords([]);
    setSpeechResult(null);
    setHasSubmitted(false);
    setIsCorrect(null);

    if (currentIndex < totalExercises - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      prepareExerciseWords(exercises[nextIdx]);
    } else {
      handleCompleteLesson();
    }
  };

  const handleCompleteLesson = async () => {
    setIsCompleted(true);

    if (user && lesson) {
      try {
        const accuracy = Math.round((correctCount / Math.max(totalExercises, 1)) * 100);
        const xpEarned = lesson.xp_reward || 20;

        // Check if lesson was previously completed
        const { data: existingProgress } = await supabase
          .from('user_lesson_progress' as any)
          .select('status')
          .eq('user_id', user.id)
          .eq('lesson_id', lesson.id)
          .maybeSingle();

        const isFirstTimeCompletion = !existingProgress || (existingProgress as any).status !== 'completed';

        // Upsert user lesson progress in Supabase
        await supabase.from('user_lesson_progress' as any).upsert(
          {
            user_id: user.id,
            lesson_id: lesson.id,
            status: 'completed',
            progress_percentage: 100,
            score: accuracy,
            best_score: accuracy,
            attempts: 1,
            completed_at: new Date().toISOString(),
            last_accessed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,lesson_id' }
        );

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        const lastActivity = profile?.last_activity_at ? new Date(profile.last_activity_at) : null;
        const lastActivityStr = lastActivity ? lastActivity.toISOString().split('T')[0] : null;

        let currentStreak = profile?.current_streak ?? 0;
        let newStreak = currentStreak;

        if (!lastActivityStr) {
          newStreak = 1;
        } else if (lastActivityStr === todayStr) {
          newStreak = Math.max(currentStreak, 1);
        } else {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (lastActivityStr === yesterdayStr) {
            newStreak = currentStreak + 1;
          } else {
            newStreak = 1;
          }
        }

        const currentLongest = profile?.longest_streak ?? 0;
        const newLongest = Math.max(newStreak, currentLongest);

        // Calculate total XP across all completed lessons
        const { data: allCompleted } = await supabase
          .from('user_lesson_progress' as any)
          .select('lesson_id, lessons(xp_reward)')
          .eq('user_id', user.id)
          .eq('status', 'completed');

        let totalCalculatedXp = xpEarned;
        if (allCompleted && allCompleted.length > 0) {
          totalCalculatedXp = allCompleted.reduce((acc: number, item: any) => {
            return acc + (item.lessons?.xp_reward || 20);
          }, 0);
        }

        const currentXp = profile?.xp ?? 0;
        const newXp = Math.max(currentXp + (isFirstTimeCompletion ? xpEarned : 0), totalCalculatedXp);

        // Update profile in Supabase with new XP, streak and activity timestamp
        await supabase
          .from('profiles' as any)
          .update({
            xp: newXp,
            current_streak: newStreak,
            longest_streak: newLongest,
            last_activity_at: now.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq('id', user.id);

        if (isFirstTimeCompletion) {
          // Insert transaction into xp_transactions table
          await supabase.from('xp_transactions' as any).insert({
            user_id: user.id,
            amount: xpEarned,
            source: 'lesson_completion',
            reference_type: 'lesson',
            reference_id: lesson.id,
            description: `Përfunduar mësimi: ${lesson.title}`,
          });
        }

        // Refresh user profile store so XP and Streak instantly reflect across app UI
        await fetchProfile();
      } catch (err) {
        console.error('Error saving completion:', err);
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </SafeAreaView>
    );
  }

  if (isCompleted) {
    const accuracy = Math.round((correctCount / Math.max(totalExercises, 1)) * 100);
    return (
      <SafeAreaView style={styles.summaryContainer}>
        <View style={styles.summaryContent}>
          <View style={styles.summaryIconCircle}>
            <Award size={64} color={Colors.light.primary} />
          </View>

          <Text style={styles.summaryTitle}>
            {language === 'en' ? 'Lesson Complete!' : 'Mësimi U Krye!'}
          </Text>
          <Text style={styles.summarySub}>{lesson?.title || ''}</Text>

          <View style={styles.summaryStatsGrid}>
            <Card style={styles.summaryStatCard}>
              <Star size={24} color={Colors.light.accentGold} />
              <Text style={styles.summaryStatVal}>+{lesson?.xp_reward || 20}</Text>
              <Text style={styles.summaryStatLbl}>
                {language === 'en' ? 'XP Earned' : 'XP të Fituara'}
              </Text>
            </Card>

            <Card style={styles.summaryStatCard}>
              <CheckCircle2 size={24} color={Colors.light.success} />
              <Text style={styles.summaryStatVal}>{accuracy}%</Text>
              <Text style={styles.summaryStatLbl}>
                {language === 'en' ? 'Accuracy' : 'Saktësia'}
              </Text>
            </Card>
          </View>

          <Button
            title={language === 'en' ? 'Continue' : 'Vazhdo'}
            variant="primary"
            size="lg"
            onPress={() => router.replace('/(tabs)/learn')}
            style={{ width: '100%', marginTop: Spacing.xl }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <X size={24} color={Colors.light.textSecondary} />
        </TouchableOpacity>

        <View style={{ flex: 1, marginHorizontal: Spacing.md }}>
          <ProgressBar progress={progressPercent} color={Colors.light.primary} height={8} />
        </View>

        <View style={styles.exerciseCounter}>
          <Text style={styles.exerciseCounterText}>
            {currentIndex + 1} / {totalExercises}
          </Text>
        </View>
      </View>

      {/* Main Exercise Area */}
      <ScrollView
        contentContainerStyle={[
          styles.exerciseScrollContent,
          { paddingBottom: Math.max(insets.bottom + 100, 120) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {currentExercise ? (
          <View style={styles.exerciseWrapper}>
            {(currentExercise.exercise_type === 'multiple_choice' ||
              currentExercise.exercise_type === 'word_selection') && (
              <MultipleChoiceExercise
                question={currentExercise.question}
                instruction={currentExercise.instruction}
                audioUrl={currentExercise.audio_url}
                options={currentExercise.exercise_options || []}
                selectedOptionId={selectedOptionId}
                onSelectOption={setSelectedOptionId}
                disabled={hasSubmitted}
              />
            )}

            {currentExercise.exercise_type === 'translation' && (
              <TranslationExercise
                question={currentExercise.question}
                instruction={currentExercise.instruction}
                userAnswer={textAnswer}
                onChangeAnswer={setTextAnswer}
                disabled={hasSubmitted}
              />
            )}

            {currentExercise.exercise_type === 'fill_blank' && (
              <FillBlankExercise
                question={currentExercise.question}
                instruction={currentExercise.instruction}
                options={currentExercise.exercise_options || []}
                selectedOptionId={selectedOptionId}
                onSelectOption={setSelectedOptionId}
                userAnswer={textAnswer}
                onChangeAnswer={setTextAnswer}
                disabled={hasSubmitted}
              />
            )}

            {(currentExercise.exercise_type === 'sentence_ordering' ||
              currentExercise.exercise_type === 'sentence_order') && (
              <SentenceOrderingExercise
                question={currentExercise.question}
                instruction={currentExercise.instruction}
                availableWords={shuffledWords}
                selectedWords={selectedWords}
                onSelectWord={(word) => setSelectedWords((prev) => [...prev, word])}
                onDeselectWord={(idx: number) =>
                  setSelectedWords((prev) => prev.filter((_, i) => i !== idx))
                }
                disabled={hasSubmitted}
              />
            )}

            {currentExercise.exercise_type === 'vocabulary' && (
              <VocabularyExercise
                word={currentExercise.question || ''}
                partOfSpeech={currentExercise.instruction || ''}
                translation={currentExercise.correct_answer || ''}
                exampleSentence={currentExercise.explanation || ''}
              />
            )}

            {(currentExercise.exercise_type === 'pronunciation' ||
              currentExercise.exercise_type === 'speaking') && (
              <PronunciationExercise
                question={currentExercise.question}
                targetSentence={currentExercise.question || currentExercise.correct_answer}
                correctAnswer={currentExercise.correct_answer}
                instruction={currentExercise.instruction}
                audioUrl={currentExercise.audio_url}
                difficulty={currentExercise.difficulty || 'easy'}
                translation={currentExercise.explanation}
                onSpeechResult={(recognizedText, accuracy, passed) => {
                  setSpeechResult({ text: recognizedText, accuracy, passed });
                }}
                disabled={hasSubmitted}
              />
            )}
          </View>
        ) : (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        )}
      </ScrollView>

      {/* Bottom Footer Feedback & Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom + 12, 16) }]}>
        {hasSubmitted ? (
          <View
            style={[
              styles.feedbackBanner,
              isCorrect ? styles.correctBanner : styles.incorrectBanner,
            ]}
          >
            <View style={styles.feedbackHeaderRow}>
              {isCorrect ? (
                <CheckCircle2 size={24} color={Colors.light.success} />
              ) : (
                <XCircle size={24} color={Colors.light.error} />
              )}
              <Text
                style={[
                  styles.feedbackTitle,
                  { color: isCorrect ? Colors.light.success : Colors.light.error },
                ]}
              >
                {isCorrect
                  ? (language === 'en' ? 'Correct Answer!' : 'Përgjigje e saktë!')
                  : (language === 'en' ? 'Incorrect Answer' : 'Përgjigje e gabuar')}
              </Text>
            </View>

            {explanation ? <Text style={styles.explanationText}>{explanation}</Text> : null}

            <Button
              title={language === 'en' ? 'Continue' : 'Vazhdo'}
              variant={isCorrect ? 'primary' : 'outline'}
              size="lg"
              onPress={handleNext}
              style={{ marginTop: Spacing.sm }}
            />
          </View>
        ) : (
          <Button
            title={language === 'en' ? 'Check Answer' : 'Kontrollo Përgjigjen'}
            variant="primary"
            size="lg"
            disabled={
              !selectedOptionId &&
              !textAnswer.trim() &&
              selectedWords.length === 0 &&
              currentExercise?.exercise_type !== 'vocabulary'
            }
            onPress={handleSubmitAnswer}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEFF5',
  },
  closeBtn: {
    padding: 6,
  },
  exerciseCounter: {
    paddingHorizontal: Spacing.sm,
  },
  exerciseCounterText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
  },
  exerciseScrollContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  exerciseWrapper: {
    flex: 1,
  },
  loaderContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EBEFF5',
  },
  feedbackBanner: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  correctBanner: {
    backgroundColor: Colors.light.successLight,
  },
  incorrectBanner: {
    backgroundColor: Colors.light.errorLight,
  },
  feedbackHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  feedbackTitle: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.md,
  },
  explanationText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs + 1,
    color: Colors.light.text,
    lineHeight: 18,
  },
  summaryContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  summaryContent: {
    width: '100%',
    alignItems: 'center',
  },
  summaryIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.xxl,
    color: Colors.light.text,
  },
  summarySub: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  summaryStatsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
    width: '100%',
  },
  summaryStatCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
  },
  summaryStatVal: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.xl,
    color: Colors.light.text,
    marginTop: Spacing.xs,
  },
  summaryStatLbl: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
  },
});
