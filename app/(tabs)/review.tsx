import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/services/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { RotateCw, Volume2, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react-native';
import { playAudioUrl } from '@/services/audio';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReviewScreen() {
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const { t, language } = useTranslation();
  const [reviewItems, setReviewItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadReviewItems = async () => {
    try {
      setLoading(true);

      const { data } = await supabase
        .from('review_items' as any)
        .select(`
          *,
          vocabulary_items (
            word,
            part_of_speech,
            pronunciation,
            audio_url,
            image_url,
            vocabulary_translations (
              translation,
              example_sentence,
              example_translation
            )
          )
        `)
        .order('next_review_at', { ascending: true })
        .limit(20);

      if (data && data.length > 0) {
        setReviewItems(data);
      } else {
        const { data: vocabData } = await supabase
          .from('vocabulary_items' as any)
          .select(`
            *,
            vocabulary_translations (
              translation,
              example_sentence,
              example_translation
            )
          `)
          .is('deleted_at', null)
          .limit(10);

        if (vocabData) {
          const formatted = vocabData.map((v: any) => ({
            id: v.id,
            vocabulary_item_id: v.id,
            ease_factor: 2.5,
            interval_days: 1,
            repetition_count: 0,
            vocabulary_items: v,
          }));
          setReviewItems(formatted);
        }
      }
    } catch (err) {
      console.error('Failed to load review items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviewItems();
  }, [user]);

  const currentItem = reviewItems[currentIndex];
  const vocab = currentItem?.vocabulary_items;
  const translationObj = vocab?.vocabulary_translations?.[0];

  const playAudio = async (url?: string) => {
    await playAudioUrl(url);
  };

  const handleGradeReview = async (quality: number) => {
    if (!user || !currentItem) return;

    let { ease_factor = 2.5, interval_days = 1, repetition_count = 0 } = currentItem;

    if (quality >= 3) {
      if (repetition_count === 0) interval_days = 1;
      else if (repetition_count === 1) interval_days = 6;
      else interval_days = Math.round(interval_days * ease_factor);
      repetition_count += 1;
    } else {
      repetition_count = 0;
      interval_days = 1;
    }

    ease_factor = Math.max(1.3, ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval_days);

    await supabase.from('review_attempts' as any).insert({
      user_id: user.id,
      review_item_id: currentItem.id,
      quality,
      previous_interval: currentItem.interval_days || 1,
      new_interval: interval_days,
    });

    await supabase.from('review_items' as any).upsert({
      id: currentItem.id,
      user_id: user.id,
      vocabulary_item_id: currentItem.vocabulary_item_id,
      ease_factor,
      interval_days,
      repetition_count,
      next_review_at: nextReviewDate.toISOString(),
      last_reviewed_at: new Date().toISOString(),
      status: quality >= 3 ? 'reviewing' : 'learning',
    });

    setIsRevealed(false);
    if (currentIndex < reviewItems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(reviewItems.length);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E56E0" />
      </SafeAreaView>
    );
  }

  if (currentIndex >= reviewItems.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.finishBox}>
          <View style={styles.finishIconBadge}>
            <CheckCircle2 size={48} color="#10B981" />
          </View>
          <Text style={styles.finishTitle}>
            {language === 'en' ? 'Review Complete!' : 'Rishikimi u krye!'}
          </Text>
          <Text style={styles.finishSub}>
            {language === 'en'
              ? 'Great job strengthening your memory today.'
              : 'Punë e shkëlqyer për të forcuar kujtesën sot.'}
          </Text>
          <TouchableOpacity
            style={styles.repeatBtn}
            onPress={() => {
              setCurrentIndex(0);
              loadReviewItems();
            }}
            activeOpacity={0.8}
          >
            <RefreshCw size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.repeatBtnText}>
              {language === 'en' ? 'Practice Again' : 'Përsërit rishikimin'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const wordText = vocab?.word || '';
  const lowerWord = wordText.toLowerCase().trim();
  let articleVariant: 'der' | 'die' | 'das' | 'primary' = 'primary';
  if (lowerWord.startsWith('der ')) articleVariant = 'der';
  else if (lowerWord.startsWith('die ')) articleVariant = 'die';
  else if (lowerWord.startsWith('das ')) articleVariant = 'das';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            {language === 'en' ? 'Vocabulary Review' : 'Rishikim Fjalori'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {language === 'en' ? 'Spaced Repetition System' : 'Sistemi i përsëritjes me hapësirë'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 100, 130) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.counterRow}>
          <View style={styles.counterBadgeContainer}>
            <Text style={styles.counterBadgeText}>
              {language === 'en' ? 'Word' : 'Fjala'} {currentIndex + 1} {language === 'en' ? 'of' : 'nga'} {reviewItems.length}
            </Text>
          </View>
        </View>

        {/* Flashcard Touch Container */}
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => setIsRevealed(!isRevealed)}
          activeOpacity={0.92}
        >
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              {vocab?.part_of_speech ? (
                <Badge label={vocab.part_of_speech} variant={articleVariant} size="sm" />
              ) : (
                <Badge label="Gjermanisht" variant={articleVariant} size="sm" />
              )}
              {vocab?.audio_url ? (
                <TouchableOpacity
                  style={styles.audioBtn}
                  onPress={() => playAudio(vocab.audio_url)}
                  activeOpacity={0.8}
                >
                  <Volume2 size={22} color="#1E56E0" />
                </TouchableOpacity>
              ) : null}
            </View>

            <Text style={styles.wordText}>{wordText}</Text>
            {vocab?.pronunciation ? (
              <Text style={styles.pronunciationText}>[{vocab.pronunciation}]</Text>
            ) : null}

            {isRevealed ? (
              <View style={styles.revealedSection}>
                <View style={styles.divider} />
                <Text style={styles.transLabel}>
                  {language === 'en' ? 'Translation' : 'Përkthimi në shqip'}
                </Text>
                <Text style={styles.transText}>{translationObj?.translation || 'Përkthim'}</Text>

                {translationObj?.example_sentence ? (
                  <View style={styles.exampleBox}>
                    <Text style={styles.exampleGerman}>{translationObj.example_sentence}</Text>
                    {translationObj?.example_translation ? (
                      <Text style={styles.exampleAlbanian}>{translationObj.example_translation}</Text>
                    ) : null}
                  </View>
                ) : null}
              </View>
            ) : (
              <View style={styles.tapToRevealBox}>
                <Sparkles size={18} color="#1E56E0" style={{ marginRight: 6 }} />
                <Text style={styles.tapToRevealText}>
                  {language === 'en' ? 'Tap to reveal translation' : 'Prek për të parë përkthimin'}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {isRevealed ? (
          <View style={styles.gradeActionsRow}>
            <TouchableOpacity
              style={[styles.gradeBtn, { backgroundColor: '#FEE2E2' }]}
              onPress={() => handleGradeReview(1)}
              activeOpacity={0.8}
            >
              <Text style={[styles.gradeBtnText, { color: '#EF4444' }]}>
                {language === 'en' ? "Don't know" : 'Nuk e di'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gradeBtn, { backgroundColor: '#FEF08A' }]}
              onPress={() => handleGradeReview(3)}
              activeOpacity={0.8}
            >
              <Text style={[styles.gradeBtnText, { color: '#D97706' }]}>
                {language === 'en' ? 'Repeat' : 'Përsërit'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.gradeBtn, { backgroundColor: '#D1FAE5' }]}
              onPress={() => handleGradeReview(5)}
              activeOpacity={0.8}
            >
              <Text style={[styles.gradeBtnText, { color: '#10B981' }]}>
                {language === 'en' ? 'Know well' : 'E di mirë'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
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
  content: {
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  counterRow: {
    alignItems: 'center',
  },
  counterBadgeContainer: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  counterBadgeText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xs,
    color: '#0284C7',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: Spacing.xl,
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  audioBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordText: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: 32,
    color: Colors.light.text,
    textAlign: 'center',
  },
  pronunciationText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  tapToRevealBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FA',
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xl,
  },
  tapToRevealText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xs + 1,
    color: '#1E56E0',
  },
  revealedSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: Spacing.md,
  },
  transLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 11,
    color: Colors.light.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  transText: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.xxl,
    color: '#1E56E0',
    textAlign: 'center',
    marginTop: 2,
  },
  exampleBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  exampleGerman: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
    textAlign: 'center',
  },
  exampleAlbanian: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  gradeActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm + 2,
    marginTop: Spacing.xs,
  },
  gradeBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeBtnText: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.sm,
  },
  finishBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  finishIconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  finishTitle: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.xxl,
    color: Colors.light.text,
  },
  finishSub: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  repeatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E56E0',
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xl,
    width: '100%',
  },
  repeatBtnText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.md,
    color: '#FFFFFF',
  },
});
