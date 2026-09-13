import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Volume2, BookOpen } from 'lucide-react-native';
import { playAudioUrl } from '@/services/audio';

import { useTranslation } from '@/hooks/useTranslation';

interface VocabularyProps {
  word: string;
  partOfSpeech?: string | null;
  pronunciation?: string | null;
  audioUrl?: string | null;
  translation: string;
  exampleSentence?: string | null;
  exampleTranslation?: string | null;
}

export const VocabularyExercise: React.FC<VocabularyProps> = ({
  word,
  partOfSpeech,
  pronunciation,
  audioUrl,
  translation,
  exampleSentence,
  exampleTranslation,
}) => {
  const { t } = useTranslation();
  const playAudio = async () => {
    await playAudioUrl(audioUrl);
  };

  // Check for German article badge
  const lowerWord = word.toLowerCase().trim();
  let articleVariant: 'der' | 'die' | 'das' | 'primary' = 'primary';
  if (lowerWord.startsWith('der ')) articleVariant = 'der';
  else if (lowerWord.startsWith('die ')) articleVariant = 'die';
  else if (lowerWord.startsWith('das ')) articleVariant = 'das';

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>{t('newWordToLearn')}</Text>

      {/* Main Flashcard Card */}
      <Card style={styles.flashcard}>
        <View style={styles.cardHeaderRow}>
          {partOfSpeech ? (
            <Badge label={partOfSpeech} variant={articleVariant} size="sm" />
          ) : null}
          {audioUrl ? (
            <TouchableOpacity style={styles.audioBtn} onPress={playAudio}>
              <Volume2 size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Word Display */}
        <Text style={styles.wordText}>{word}</Text>
        {pronunciation ? (
          <Text style={styles.pronunciationText}>[{pronunciation}]</Text>
        ) : null}

        <View style={styles.divider} />

        {/* Translation */}
        <Text style={styles.translationLabel}>{t('translationLabel')}</Text>
        <Text style={styles.translationText}>{translation}</Text>

        {/* Example Sentence Box */}
        {exampleSentence ? (
          <View style={styles.exampleBox}>
            <Text style={styles.exampleGerman}>{exampleSentence}</Text>
            {exampleTranslation ? (
              <Text style={styles.exampleAlbanian}>{exampleTranslation}</Text>
            ) : null}
          </View>
        ) : null}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  instructionText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
  },
  flashcard: {
    padding: Spacing.xl,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Colors.light.primaryLight,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  audioBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordText: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.display,
    color: Colors.light.text,
  },
  pronunciationText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: Spacing.lg,
  },
  translationLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
  },
  translationText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xxl,
    color: Colors.light.primary,
    marginTop: 2,
  },
  exampleBox: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.light.surfaceSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  exampleGerman: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.md,
    color: Colors.light.text,
  },
  exampleAlbanian: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
});
