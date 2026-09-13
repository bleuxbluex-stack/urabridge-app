import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { X, Crown, Check, Sparkles, ShieldCheck } from 'lucide-react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/services/supabase';

export default function PaywallScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const expiresAt = new Date();
      if (selectedPlan === 'yearly') {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }

      await supabase.from('entitlements' as any).insert({
        user_id: user.id,
        entitlement: 'premium',
        status: 'active',
        starts_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        source: 'paddle_checkout',
      });

      router.back();
    } catch (err) {
      console.error('Subscription error:', err);
    } finally {
      setLoading(false);
    }
  };

  const yearlyCardStyle: ViewStyle = selectedPlan === 'yearly'
    ? { ...styles.planCard, ...styles.selectedPlanCard }
    : styles.planCard;

  const monthlyCardStyle: ViewStyle = selectedPlan === 'monthly'
    ? { ...styles.planCard, ...styles.selectedPlanCard }
    : styles.planCard;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={24} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <View style={styles.crownCircle}>
            <Crown size={36} color={Colors.light.accentGold} />
          </View>
          <Text style={styles.heroTitle}>Mësoni pa kufij me Ura Premium</Text>
          <Text style={styles.heroSub}>
            Qasuni në të gjitha 27+ njësi, biseda inteligjente me AI dhe modalitetin offline.
          </Text>
        </View>

        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <View style={styles.checkCircle}>
              <Check size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.benefitText}>Të gjitha nivelet (A1, A2, B1, B2) të zhbllokuara</Text>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.checkCircle}>
              <Check size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.benefitText}>Mësim me audio & dëgjim të shqiptimit me AI</Text>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.checkCircle}>
              <Check size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.benefitText}>Shkarkime offline për mësim pa internet</Text>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.checkCircle}>
              <Check size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.benefitText}>Përsëritje e pakufizuar me Spaced Repetition (SRS)</Text>
          </View>
        </View>

        <View style={styles.plansContainer}>
          <TouchableOpacity
            onPress={() => setSelectedPlan('yearly')}
            activeOpacity={0.9}
          >
            <Card style={yearlyCardStyle}>
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>VLERAT MË E MIRË (-33%)</Text>
              </View>

              <View style={styles.planHeaderRow}>
                <View>
                  <Text style={styles.planTitle}>Plani Vjetor</Text>
                  <Text style={styles.planSub}>Faturuar 79.00 CHF në vit</Text>
                </View>
                <Text style={styles.planPrice}>6.58 CHF<Text style={styles.perMonth}>/muaj</Text></Text>
              </View>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedPlan('monthly')}
            activeOpacity={0.9}
          >
            <Card style={monthlyCardStyle}>
              <View style={styles.planHeaderRow}>
                <View>
                  <Text style={styles.planTitle}>Plani Mujor</Text>
                  <Text style={styles.planSub}>Anuloni kur do dëshironi</Text>
                </View>
                <Text style={styles.planPrice}>9.90 CHF<Text style={styles.perMonth}>/muaj</Text></Text>
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        <Button
          title="BOHU PREMIUM TANI"
          variant="primary"
          size="lg"
          loading={loading}
          icon={<Sparkles size={20} color="#FFFFFF" />}
          onPress={handleSubscribe}
          style={{ marginTop: Spacing.md }}
        />

        <View style={styles.guaranteeRow}>
          <ShieldCheck size={16} color={Colors.light.textSecondary} />
          <Text style={styles.guaranteeText}>Blerje e sigurt. Anuloni në çdo kohë.</Text>
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
  topBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    alignItems: 'flex-end',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  crownCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  heroTitle: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.xxl,
    color: Colors.light.text,
    textAlign: 'center',
  },
  heroSub: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  benefitsList: {
    gap: Spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
  },
  plansContainer: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  planCard: {
    padding: Spacing.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  selectedPlanCard: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  bestValueBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.accentGold,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  bestValueText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 10,
    color: '#FFFFFF',
  },
  planHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.md,
    color: Colors.light.text,
  },
  planSub: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  planPrice: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.lg,
    color: Colors.light.primary,
  },
  perMonth: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.light.textSecondary,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  guaranteeText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
  },
});
