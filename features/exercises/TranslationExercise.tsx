import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Languages } from 'lucide-react-native';

import { useTranslation } from '@/hooks/useTranslation';

interface TranslationProps {
  question: string;
  instruction?: string | null;
  userAnswer: string;
  onChangeAnswer: (text: string) => void;
  disabled?: boolean;
}

export const TranslationExercise: React.FC<TranslationProps> = ({
  question,
  instruction,
  userAnswer,
  onChangeAnswer,
  disabled = false,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>
        {instruction || t('translateSentence')}
      </Text>

      {/* Question Card */}
      <Card style={styles.questionCard}>
        <View style={styles.headerRow}>
          <Languages size={20} color={Colors.light.primary} />
          <Text style={styles.langTag}>Gjermanisht</Text>
        </View>
        <Text style={styles.questionText}>{question}</Text>
      </Card>

      {/* Answer Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{t('yourTranslation')}</Text>
        <TextInput
          style={styles.textInput}
          placeholder={t('typeTranslationPlaceholder')}
          placeholderTextColor={Colors.light.textMuted}
          value={userAnswer}
          onChangeText={onChangeAnswer}
          editable={!disabled}
          multiline
          numberOfLines={3}
        />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  langTag: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xs,
    color: Colors.light.primary,
    textTransform: 'uppercase',
  },
  questionText: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.xl,
    color: Colors.light.text,
    lineHeight: 28,
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
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.lg,
    color: Colors.light.text,
    minHeight: 110,
    textAlignVertical: 'top',
  },
});
