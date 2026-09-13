import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Volume2 } from 'lucide-react-native';
import { playAudioUrl } from '@/services/audio';

interface Option {
  id: string;
  option_text: string;
  translation?: string | null;
  is_correct: boolean;
  audio_url?: string | null;
}

import { useTranslation } from '@/hooks/useTranslation';

interface Option {
  id: string;
  option_text: string;
  translation?: string | null;
  is_correct: boolean;
  audio_url?: string | null;
}

interface MultipleChoiceProps {
  question: string;
  instruction?: string | null;
  audioUrl?: string | null;
  options: Option[];
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  disabled?: boolean;
}

export const MultipleChoiceExercise: React.FC<MultipleChoiceProps> = ({
  question,
  instruction,
  audioUrl,
  options,
  selectedOptionId,
  onSelectOption,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const playAudio = async (url: string) => {
    await playAudioUrl(url);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>
        {instruction || t('selectCorrectAnswer')}
      </Text>

      {/* Question Card */}
      <Card style={styles.questionCard}>
        <View style={styles.questionRow}>
          <Text style={styles.questionText}>{question}</Text>
          {audioUrl ? (
            <TouchableOpacity
              style={styles.audioBtn}
              onPress={() => playAudio(audioUrl)}
            >
              <Volume2 size={24} color={Colors.light.primary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </Card>

      {/* Options List */}
      <View style={styles.optionsList}>
        {options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.optionCard,
                isSelected && styles.selectedOptionCard,
              ]}
              disabled={disabled}
              onPress={() => onSelectOption(opt.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.selectedOptionText,
                ]}
              >
                {opt.option_text}
              </Text>
              {opt.translation ? (
                <Text style={styles.optionTranslation}>{opt.translation}</Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
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
  questionCard: {
    padding: Spacing.xl,
    backgroundColor: '#FFFFFF',
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionText: {
    flex: 1,
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.xl,
    color: Colors.light.text,
  },
  audioBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  optionsList: {
    gap: Spacing.md,
  },
  optionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  selectedOptionCard: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  optionText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    color: Colors.light.text,
  },
  selectedOptionText: {
    color: Colors.light.primary,
  },
  optionTranslation: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
});
