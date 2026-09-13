import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

import { useTranslation } from '@/hooks/useTranslation';

interface SentenceOrderingProps {
  question: string; // Original target sentence or prompt
  instruction?: string | null;
  availableWords: string[];
  selectedWords: string[];
  onSelectWord: (word: string, index: number) => void;
  onDeselectWord: (index: number) => void;
  disabled?: boolean;
}

export const SentenceOrderingExercise: React.FC<SentenceOrderingProps> = ({
  question,
  instruction,
  availableWords,
  selectedWords,
  onSelectWord,
  onDeselectWord,
  disabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>
        {instruction || t('sentenceOrderingInstruction')}
      </Text>

      {question ? (
        <Card style={styles.promptCard} variant="flat">
          <Text style={styles.promptText}>{question}</Text>
        </Card>
      ) : null}

      {/* Target Construction Area */}
      <View style={styles.targetContainer}>
        {selectedWords.length === 0 ? (
          <Text style={styles.placeholderText}>{t('tapWordsPlaceholder')}</Text>
        ) : (
          <View style={styles.wordPillRow}>
            {selectedWords.map((word, idx) => (
              <TouchableOpacity
                key={`selected_${word}_${idx}`}
                style={styles.selectedPill}
                disabled={disabled}
                onPress={() => onDeselectWord(idx)}
                activeOpacity={0.7}
              >
                <Text style={styles.selectedPillText}>{word}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Available Pool of Words */}
      <View style={styles.poolContainer}>
        {availableWords.map((word, idx) => (
          <TouchableOpacity
            key={`pool_${word}_${idx}`}
            style={styles.poolPill}
            disabled={disabled}
            onPress={() => onSelectWord(word, idx)}
            activeOpacity={0.7}
          >
            <Text style={styles.poolPillText}>{word}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  promptCard: {
    padding: Spacing.md,
  },
  promptText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.md,
    color: Colors.light.text,
  },
  targetContainer: {
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.light.primaryLight,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textMuted,
  },
  wordPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    width: '100%',
  },
  selectedPill: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  selectedPillText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.md,
    color: '#FFFFFF',
  },
  poolContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  poolPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  poolPillText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.md,
    color: Colors.light.text,
  },
});
