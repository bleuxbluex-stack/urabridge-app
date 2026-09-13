import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { supabase } from '@/services/supabase';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMsg('Ju lutemi vendosni email-in tuaj.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Ndodhi një gabim.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={Colors.light.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Rilidhim llogarinë</Text>
            <Text style={styles.subtitle}>
              Vendosni email-in tuaj për të marrë udhëzimet e rivendosjes së fjalëkalimit.
            </Text>
          </View>

          {success ? (
            <View style={styles.successCard}>
              <CheckCircle2 size={48} color={Colors.light.success} style={{ marginBottom: Spacing.md }} />
              <Text style={styles.successTitle}>Email-i u dërgua me sukses!</Text>
              <Text style={styles.successText}>
                Ju kemi dërguar një vegëz për rivendosjen e fjalëkalimit tek {email}.
              </Text>
              <Button
                title="KTHEHU TEK HYRJA"
                variant="outline"
                size="md"
                onPress={() => router.replace('/(auth)/login')}
                style={{ marginTop: Spacing.lg, width: '100%' }}
              />
            </View>
          ) : (
            <>
              {errorMsg ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{errorMsg}</Text>
                </View>
              ) : null}

              <View style={styles.form}>
                <Input
                  label="Email"
                  placeholder="shembull@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={<Mail size={20} color={Colors.light.textMuted} />}
                />

                <Button
                  title="DËRGO VEGËZËN"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  onPress={handleResetPassword}
                  style={{ marginTop: Spacing.md }}
                />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    flexGrow: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.xxl,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.md,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  errorBanner: {
    backgroundColor: Colors.light.errorLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.accentRed,
  },
  errorBannerText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.light.accentRed,
  },
  form: {
    marginBottom: Spacing.xl,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
  },
  successTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  successText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
