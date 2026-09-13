import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/services/supabase';
import { uploadToCloudinary } from '@/services/cloudinary';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguageStore } from '@/store/useLanguageStore';
import {
  User,
  Crown,
  Bell,
  Volume2,
  Smartphone,
  LogOut,
  ChevronRight,
  Target,
  Sparkles,
  Globe,
  Camera,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, language } = useTranslation();
  const { setLanguage } = useLanguageStore();
  const { user, profile, preferences, signOut, fetchProfile } = useAuthStore();

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    preferences?.notifications_enabled ?? true
  );
  const [soundEnabled, setSoundEnabled] = useState(
    preferences?.sound_enabled ?? true
  );
  const [hapticEnabled, setHapticEnabled] = useState(
    preferences?.haptic_enabled ?? true
  );
  const [isPremium, setIsPremium] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handlePickAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          language === 'en' ? 'Permission Required' : 'Kërkohet Leje',
          language === 'en'
            ? 'Please allow access to your photo library to update your profile picture.'
            : 'Ju lutemi lejoni qasjen në galeri për të ndryshuar foton e profilit.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setIsUploadingAvatar(true);
        const selectedUri = result.assets[0].uri;

        // Upload image to Cloudinary
        const cdnUrl = await uploadToCloudinary(selectedUri);

        // Update profile in Supabase
        if (user) {
          const { error } = await supabase
            .from('profiles' as any)
            .update({
              avatar_url: cdnUrl,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (error) throw error;

          // Refresh store profile
          await fetchProfile();

          Alert.alert(
            language === 'en' ? 'Success' : 'Sukses',
            language === 'en'
              ? 'Profile picture updated successfully!'
              : 'Fotoja e profilit u përditësua me sukses!'
          );
        }
      }
    } catch (err: any) {
      console.error('Error uploading profile picture:', err);
      Alert.alert(
        language === 'en' ? 'Upload Failed' : 'Dështoi Ngarkimi',
        err.message || (language === 'en' ? 'Failed to upload photo.' : 'Nuk u arrit të ngarkohet fotoja.')
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const fetchEntitlement = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('entitlements' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (data) {
        setIsPremium(true);
      }
    } catch (err) {
      console.error('Error checking entitlement:', err);
    }
  };

  useEffect(() => {
    fetchEntitlement();
  }, [user]);

  const handleTogglePreference = async (key: string, value: boolean) => {
    if (!user) return;
    try {
      if (key === 'notifications') setNotificationsEnabled(value);
      if (key === 'sound') setSoundEnabled(value);
      if (key === 'haptic') setHapticEnabled(value);

      await supabase.from('user_preferences' as any).upsert(
        {
          user_id: user.id,
          notifications_enabled: key === 'notifications' ? value : notificationsEnabled,
          sound_enabled: key === 'sound' ? value : soundEnabled,
          haptic_enabled: key === 'haptic' ? value : hapticEnabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
    } catch (err) {
      console.error('Error updating preference:', err);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      language === 'en' ? 'Sign Out' : 'Dalje',
      language === 'en' ? 'Are you sure you want to sign out?' : 'A jeni të sigurt që dëshironi të dilni nga llogaria?',
      [
        { text: language === 'en' ? 'Cancel' : 'Anulo', style: 'cancel' },
        {
          text: language === 'en' ? 'Sign Out' : 'Dalje',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            {language === 'en' ? 'My Profile' : 'Profili Im'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {language === 'en' ? 'Account & Preferences' : 'Llogaria & Preferencat'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 100, 130) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Header Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handlePickAvatar}
            disabled={isUploadingAvatar}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop' }}
              style={styles.avatarImage}
            />
            {isUploadingAvatar ? (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            ) : (
              <View style={styles.cameraBadge}>
                <Camera size={12} color="#FFFFFF" />
              </View>
            )}
            <View style={styles.onlineBadge} />
          </TouchableOpacity>

          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>
              {profile?.display_name || profile?.full_name || (language === 'en' ? 'German Learner' : 'Nxënës i Gjermanishtes')}
            </Text>
            <Text style={styles.profileEmail}>{user?.email || 'user@email.com'}</Text>

            <View style={styles.badgeRow}>
              <View style={[styles.pillBadge, { backgroundColor: isPremium ? '#FEF08A' : '#E0F2FE' }]}>
                <Text style={[styles.pillBadgeText, { color: isPremium ? '#D97706' : '#0284C7' }]}>
                  {isPremium ? (language === 'en' ? 'Premium' : 'Premium') : (language === 'en' ? 'Free Plan' : 'Plani Falas')}
                </Text>
              </View>
              <View style={[styles.pillBadge, { backgroundColor: '#F1F5F9' }]}>
                <Text style={[styles.pillBadgeText, { color: '#475569' }]}>A1 Gjermanisht</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Vivid Blue Premium Banner Card */}
        <LinearGradient
          colors={['#1E56E0', '#0284C7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.premiumBanner}
        >
          <View style={styles.premiumHeader}>
            <View style={styles.crownCircle}>
              <Crown size={24} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.premiumTitle}>
                {isPremium
                  ? (language === 'en' ? 'Premium Unlocked' : 'Premium Aktiv')
                  : (language === 'en' ? 'Upgrade to Premium' : 'Kaloni në Premium')}
              </Text>
              <Text style={styles.premiumSub}>
                {isPremium
                  ? (language === 'en' ? 'Unlimited lessons & review' : 'Mësime dhe rishikim të pakufizuar')
                  : (language === 'en' ? 'Unlock all A1-B2 courses & audio' : 'Zhbllokoni të gjitha kurset & audion')}
              </Text>
            </View>
          </View>

          {!isPremium && (
            <TouchableOpacity
              style={styles.premiumCtaBtn}
              onPress={() => router.push('/paywall')}
              activeOpacity={0.85}
            >
              <Sparkles size={16} color="#1E56E0" style={{ marginRight: 6 }} />
              <Text style={styles.premiumCtaText}>
                {language === 'en' ? 'View Premium Plans' : 'Shiko Planet Premium'}
              </Text>
            </TouchableOpacity>
          )}
        </LinearGradient>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'en' ? 'Preferences' : 'Preferencat'}
          </Text>

          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelGroup}>
                <View style={[styles.settingIconBadge, { backgroundColor: '#E0F2FE' }]}>
                  <Bell size={18} color="#0284C7" />
                </View>
                <Text style={styles.settingText}>
                  {language === 'en' ? 'Daily Notifications' : 'Njoftime Ditore'}
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={(val) => handleTogglePreference('notifications', val)}
                trackColor={{ false: '#CBD5E1', true: '#1E56E0' }}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLabelGroup}>
                <View style={[styles.settingIconBadge, { backgroundColor: '#FEF08A' }]}>
                  <Volume2 size={18} color="#D97706" />
                </View>
                <Text style={styles.settingText}>
                  {language === 'en' ? 'Sound Effects' : 'Efektet me Zë'}
                </Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={(val) => handleTogglePreference('sound', val)}
                trackColor={{ false: '#CBD5E1', true: '#1E56E0' }}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLabelGroup}>
                <View style={[styles.settingIconBadge, { backgroundColor: '#F5F3FF' }]}>
                  <Smartphone size={18} color="#8B5CF6" />
                </View>
                <Text style={styles.settingText}>
                  {language === 'en' ? 'Haptic Feedback' : 'Vibrim & Haptic'}
                </Text>
              </View>
              <Switch
                value={hapticEnabled}
                onValueChange={(val) => handleTogglePreference('haptic', val)}
                trackColor={{ false: '#CBD5E1', true: '#1E56E0' }}
              />
            </View>

            <View style={styles.divider} />

            {/* Language Switcher Row */}
            <View style={styles.settingRow}>
              <View style={styles.settingLabelGroup}>
                <View style={[styles.settingIconBadge, { backgroundColor: '#ECFDF5' }]}>
                  <Globe size={18} color="#10B981" />
                </View>
                <Text style={styles.settingText}>
                  {language === 'en' ? 'App Language' : 'Gjuha e Aplikacionit'}
                </Text>
              </View>
              <View style={styles.langPillContainer}>
                <TouchableOpacity
                  style={[styles.langBtnPill, language === 'sq' && styles.langBtnPillActive]}
                  onPress={() => setLanguage('sq')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.langBtnText, language === 'sq' && styles.langBtnTextActive]}>
                    🇦🇱 SQ
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.langBtnPill, language === 'en' && styles.langBtnPillActive]}
                  onPress={() => setLanguage('en')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.langBtnText, language === 'en' && styles.langBtnTextActive]}>
                    🇬🇧 EN
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Daily Goal Option */}
        <TouchableOpacity
          onPress={() => router.push('/(onboarding)/goal')}
          activeOpacity={0.8}
          style={styles.optionCard}
        >
          <View style={styles.optionRow}>
            <View style={[styles.settingIconBadge, { backgroundColor: '#FFEDD5' }]}>
              <Target size={18} color="#EA580C" />
            </View>
            <Text style={styles.optionText}>
              {language === 'en' ? 'Change Daily Goal' : 'Ndrysho Qëllimin Ditor'}
            </Text>
            <ChevronRight size={18} color="#94A3B8" style={{ marginLeft: 'auto' }} />
          </View>
        </TouchableOpacity>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <LogOut size={18} color="#EF4444" style={{ marginRight: 6 }} />
          <Text style={styles.signOutBtnText}>
            {language === 'en' ? 'Sign Out' : 'Dil nga Llogaria'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollContent: {
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.lg,
    gap: Spacing.lg,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  cameraBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1E56E0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.lg,
    color: Colors.light.text,
  },
  profileEmail: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  pillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  pillBadgeText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 11,
  },
  premiumBanner: {
    borderRadius: 24,
    padding: Spacing.lg,
    shadowColor: '#1E56E0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  crownCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF08A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumTitle: {
    fontFamily: Typography.fontFamily.extraBold,
    fontSize: Typography.fontSize.md + 1,
    color: '#FFFFFF',
  },
  premiumSub: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  premiumCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  premiumCtaText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.sm,
    color: '#1E56E0',
  },
  section: {
    gap: Spacing.xs + 2,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.md,
    color: Colors.light.text,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  settingLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  settingIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.sm + 1,
    color: Colors.light.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  optionText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.sm + 1,
    color: Colors.light.text,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginTop: Spacing.xs,
  },
  signOutBtnText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.md,
    color: '#EF4444',
  },
  langPillContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: BorderRadius.lg,
    padding: 3,
    gap: 4,
  },
  langBtnPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  langBtnPillActive: {
    backgroundColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  langBtnText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
  },
  langBtnTextActive: {
    color: '#FFFFFF',
  },
});
