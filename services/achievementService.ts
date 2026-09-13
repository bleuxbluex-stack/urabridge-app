import { supabase } from './supabase';

export const DEFAULT_ACHIEVEMENTS = [
  {
    code: 'first_step',
    title: 'Hapat e Parë',
    description: 'Përfundo mësimin tënd të parë në gjermanisht',
    requirement_type: 'lessons_completed',
    requirement_value: 1,
    xp_reward: 20,
  },
  {
    code: 'streak_1',
    title: 'Fillimi i Rrugëtimit',
    description: 'Fillo 1 ditë radhazi aktivitet mësimor',
    requirement_type: 'current_streak',
    requirement_value: 1,
    xp_reward: 30,
  },
  {
    code: 'xp_20',
    title: 'Mbledhës i XP',
    description: 'Arrij të paktën 20 XP gjithsej',
    requirement_type: 'xp',
    requirement_value: 20,
    xp_reward: 25,
  },
  {
    code: 'lessons_3',
    title: 'Nxënës i Përkushtuar',
    description: 'Përfundo 3 mësime të ndryshme',
    requirement_type: 'lessons_completed',
    requirement_value: 3,
    xp_reward: 50,
  },
  {
    code: 'streak_3',
    title: 'Zjarri i Mësimit',
    description: 'Arrij 3 ditë radhazi mësim',
    requirement_type: 'current_streak',
    requirement_value: 3,
    xp_reward: 75,
  },
  {
    code: 'xp_100',
    title: 'Mjeshtër i Gjermanishtes',
    description: 'Arrij 100 XP në total',
    requirement_type: 'xp',
    requirement_value: 100,
    xp_reward: 100,
  },
];

export async function checkAndUnlockAchievements(
  userId: string,
  stats: { lessonsCompleted: number; currentStreak: number; totalXp: number }
) {
  try {
    if (!userId) return;

    // 1. Fetch active achievements from database
    let { data: dbAchievements } = await supabase
      .from('achievements' as any)
      .select('*')
      .eq('is_active', true);

    // 2. Seed default achievements if database table is empty
    if (!dbAchievements || dbAchievements.length === 0) {
      for (const achItem of DEFAULT_ACHIEVEMENTS) {
        await supabase.from('achievements' as any).upsert(
          {
            ...achItem,
            is_active: true,
          },
          { onConflict: 'code' }
        );
      }
      const { data: seeded } = await supabase
        .from('achievements' as any)
        .select('*')
        .eq('is_active', true);
      dbAchievements = seeded || [];
    }

    if (!dbAchievements || dbAchievements.length === 0) return;

    // 3. Fetch user unlocked achievements
    const { data: unlockedData } = await supabase
      .from('user_achievements' as any)
      .select('achievement_id')
      .eq('user_id', userId);

    const unlockedSet = new Set<string>();
    if (unlockedData) {
      unlockedData.forEach((u: any) => {
        if (u.achievement_id) unlockedSet.add(String(u.achievement_id));
      });
    }

    // 4. Check eligibility and unlock missing achievements
    for (const ach of dbAchievements) {
      if (unlockedSet.has(String(ach.id)) || unlockedSet.has(String(ach.code))) {
        continue;
      }

      const reqType = String(ach.requirement_type || '').toLowerCase();
      const reqVal = Number(ach.requirement_value || 0);

      let isEligible = false;
      if (reqType.includes('xp') && stats.totalXp >= reqVal) {
        isEligible = true;
      } else if ((reqType.includes('streak') || reqType.includes('day')) && stats.currentStreak >= reqVal) {
        isEligible = true;
      } else if ((reqType.includes('lesson') || reqType.includes('course')) && stats.lessonsCompleted >= reqVal) {
        isEligible = true;
      }

      if (isEligible) {
        // Unlock achievement in user_achievements table
        await supabase.from('user_achievements' as any).insert({
          user_id: userId,
          achievement_id: ach.id,
          unlocked_at: new Date().toISOString(),
        });

        unlockedSet.add(String(ach.id));

        // Log transaction for bonus achievement XP if applicable
        if (ach.xp_reward && ach.xp_reward > 0) {
          await supabase.from('xp_transactions' as any).insert({
            user_id: userId,
            amount: ach.xp_reward,
            source: 'achievement_unlocked',
            reference_type: 'achievement',
            reference_id: ach.id,
            description: `Medalje e zhbllokuar: ${ach.title}`,
          });
        }
      }
    }
  } catch (err) {
    console.error('Error checking/unlocking achievements:', err);
  }
}
