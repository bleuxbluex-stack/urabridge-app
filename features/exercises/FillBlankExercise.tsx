import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useTranslation } from '@/hooks/useTranslation';

interface Option {
  id: string;
  option_text: string;
  is_correct: boolean;
}

interface FillBlankProps {
  question: string; // e.g. "Guten ___! (mirëdita)"
  instruction?: string | null;
  options: Option[];
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  userAnswer?: string;
  onChangeAnswer?: (text: string) => void;
  disabled?: boolean;
}

export const FillBlankExercise: React.FC<FillBlankProps> = ({
  question,
  instruction,
  options,
  selectedOptionId,
  onSelectOption,
  userAnswer = '',
  onChangeAnswer,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const hasOptions = options && options.length > 0;

  const selectedOption = hasOptions ? options.find((o) => o.id === selectedOptionId) : null;

  // Render question with filled blank or placeholder
  const filledText = hasOptions
    ? selectedOption?.option_text
    : userAnswer.trim();

  const formattedQuestion = filledText
    ? question.replace('___', filledText)
    : question;

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>
        {instruction || t('fillBlankInstruction')}
      </Text>

      {/* Sentence Display Card */}
      <Card style={styles.sentenceCard}>
        <Text style={styles.sentenceText}>{formattedQuestion}</Text>
      </Card>

      {/* If options exist, render option pills */}
      {hasOptions ? (
        <View style={styles.optionsGrid}>
          {options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.optionPill,
                  isSelected && styles.selectedOptionPill,
                ]}
                disabled={disabled}
                onPress={() => onSelectOption(opt.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.optionPillText,
                    isSelected && styles.selectedOptionPillText,
                  ]}
                >
                  {opt.option_text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        /* Fallback: Text Input when options array is empty */
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t('yourTranslation')}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={t('typeTranslationPlaceholder')}
            placeholderTextColor={Colors.light.textMuted}
            value={userAnswer}
            onChangeText={onChangeAnswer}
            editable={!disabled}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>
      )}
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
  sentenceCard: {
    padding: Spacing.xl,
    backgroundColor: '#FFFFFF',
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sentenceText: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.xxl,
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 34,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  optionPill: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.light.border,
    minWidth: 90,
    alignItems: 'center',
  },
  selectedOptionPill: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  optionPillText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    color: Colors.light.text,
  },
  selectedOptionPillText: {
    color: Colors.light.primary,
  },
  inputContainer: {
    marginTop: Spacing.xs,
  },
  inputLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xl,
    color: Colors.light.text,
    minHeight: 60,
  },
});
