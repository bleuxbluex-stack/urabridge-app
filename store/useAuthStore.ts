import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';
import { checkAndUnlockAchievements } from '@/services/achievementService';
import { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  preferences: UserPreferences | null;
  isLoading: boolean;
  isInitialized: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setPreferences: (preferences: UserPreferences | null) => void;
  fetchProfile: () => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  preferences: null,
  isLoading: true,
  isInitialized: false,

  setSession: (session) => set({ session, user: session?.user ?? null }),
  setProfile: (profile) => set({ profile }),
  setPreferences: (preferences) => set({ preferences }),

  fetchProfile: async () => {
    const user = get().user;
    if (!user) {
      set({ profile: null, preferences: null });
      return;
    }

    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError.message);
      }

      if (profileData) {
        // Calculate total XP & Day Streak from user_lesson_progress to backfill if out of sync
        const { data: completedProgress } = await supabase
          .from('user_lesson_progress' as any)
          .select('completed_at, lesson_id, lessons(xp_reward)')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false });

        if (completedProgress && completedProgress.length > 0) {
          // 1. XP calculation
          const totalCalculatedXp = completedProgress.reduce((sum: number, item: any) => {
            return sum + (item.lessons?.xp_reward || 20);
          }, 0);

          if (totalCalculatedXp > (profileData.xp || 0)) {
            profileData.xp = totalCalculatedXp;
          }

          // 2. Day streak backfill check
          const latestCompleted = completedProgress[0].completed_at;
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (latestCompleted) {
            const latestStr = new Date(latestCompleted).toISOString().split('T')[0];
            if ((latestStr === todayStr || latestStr === yesterdayStr) && (profileData.current_streak || 0) === 0) {
              profileData.current_streak = 1;
              if ((profileData.longest_streak || 0) < 1) {
                profileData.longest_streak = 1;
              }
              profileData.last_activity_at = latestCompleted;
            }
          }

          // Persist updated XP & streak to Supabase profiles table
          await supabase
            .from('profiles' as any)
            .update({
              xp: profileData.xp,
              current_streak: profileData.current_streak,
              longest_streak: Math.max(profileData.current_streak || 0, profileData.longest_streak || 0),
              last_activity_at: profileData.last_activity_at,
            })
            .eq('id', user.id);

          // 3. Automatically check and unlock achievements based on updated progress
          if (typeof checkAndUnlockAchievements === 'function') {
            try {
              await checkAndUnlockAchievements(user.id, {
                lessonsCompleted: completedProgress.length,
                currentStreak: profileData.current_streak || 0,
                totalXp: profileData.xp || 0,
              });
            } catch (achErr) {
              console.error('Error auto-unlocking achievements:', achErr);
            }
          }
        }
      }

      // Fetch preferences
      const { data: prefData, error: prefError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (prefError) {
        console.error('Error fetching preferences:', prefError.message);
      }

      set({
        profile: profileData ?? null,
        preferences: prefData ?? null,
      });
    } catch (err) {
      console.error('Failed to fetch profile/preferences:', err);
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    await supabase.auth.signOut();
    set({
      session: null,
      user: null,
      profile: null,
      preferences: null,
      isLoading: false,
    });
  },

  initialize: async () => {
    try {
      set({ isLoading: true });
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null });

      if (session?.user) {
        await get().fetchProfile();
      }
    } catch (err) {
      console.error('Failed auth initialization:', err);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }

    // Set up auth state change listener
    supabase.auth.onAuthStateChange(async (event, session) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) {
        await get().fetchProfile();
      } else {
        set({ profile: null, preferences: null });
      }
    });
  },
}));
