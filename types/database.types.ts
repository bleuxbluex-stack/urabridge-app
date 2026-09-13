export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = 'admin' | 'moderator' | 'user';

export interface Database {
  public: {
    Tables: {
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: AppRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role?: AppRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: AppRole;
          created_at?: string;
        };
      };
      languages: {
        Row: {
          id: string;
          code: string;
          name: string;
          native_name: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          native_name: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          native_name?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      language_pairs: {
        Row: {
          id: string;
          source_language_id: string;
          target_language_id: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_language_id: string;
          target_language_id: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          source_language_id?: string;
          target_language_id?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          language_pair_id: string;
          title: string;
          description: string | null;
          slug: string;
          image_url: string | null;
          is_published: boolean;
          sort_order: number;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          language_pair_id: string;
          title: string;
          description?: string | null;
          slug: string;
          image_url?: string | null;
          is_published?: boolean;
          sort_order?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          language_pair_id?: string;
          title?: string;
          description?: string | null;
          slug?: string;
          image_url?: string | null;
          is_published?: boolean;
          sort_order?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      course_levels: {
        Row: {
          id: string;
          course_id: string;
          code: string;
          title: string;
          description: string | null;
          sort_order: number;
          is_locked: boolean;
          is_published: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          code: string;
          title: string;
          description?: string | null;
          sort_order?: number;
          is_locked?: boolean;
          is_published?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          code?: string;
          title?: string;
          description?: string | null;
          sort_order?: number;
          is_locked?: boolean;
          is_published?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      learning_paths: {
        Row: {
          id: string;
          course_level_id: string;
          title: string;
          description: string | null;
          sort_order: number;
          is_published: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_level_id: string;
          title: string;
          description?: string | null;
          sort_order?: number;
          is_published?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_level_id?: string;
          title?: string;
          description?: string | null;
          sort_order?: number;
          is_published?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      modules: {
        Row: {
          id: string;
          learning_path_id: string;
          title: string;
          description: string | null;
          slug: string;
          sort_order: number;
          image_url: string | null;
          is_published: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          learning_path_id: string;
          title: string;
          description?: string | null;
          slug: string;
          sort_order?: number;
          image_url?: string | null;
          is_published?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          learning_path_id?: string;
          title?: string;
          description?: string | null;
          slug?: string;
          sort_order?: number;
          image_url?: string | null;
          is_published?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          description: string | null;
          slug: string;
          lesson_type: string;
          estimated_minutes: number;
          xp_reward: number;
          sort_order: number;
          is_free: boolean;
          is_published: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          description?: string | null;
          slug: string;
          lesson_type?: string;
          estimated_minutes?: number;
          xp_reward?: number;
          sort_order?: number;
          is_free?: boolean;
          is_published?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          title?: string;
          description?: string | null;
          slug?: string;
          lesson_type?: string;
          estimated_minutes?: number;
          xp_reward?: number;
          sort_order?: number;
          is_free?: boolean;
          is_published?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      lesson_prerequisites: {
        Row: {
          id: string;
          lesson_id: string;
          prerequisite_lesson_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          prerequisite_lesson_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          prerequisite_lesson_id?: string;
          created_at?: string;
        };
      };
      lesson_sections: {
        Row: {
          id: string;
          lesson_id: string;
          title: string;
          description: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          title: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          title?: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      exercises: {
        Row: {
          id: string;
          lesson_id: string;
          section_id: string | null;
          exercise_type: string;
          question: string;
          instruction: string | null;
          explanation: string | null;
          correct_answer: string | null;
          audio_url: string | null;
          image_url: string | null;
          points: number;
          sort_order: number;
          metadata: Json;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          section_id?: string | null;
          exercise_type: string;
          question: string;
          instruction?: string | null;
          explanation?: string | null;
          correct_answer?: string | null;
          audio_url?: string | null;
          image_url?: string | null;
          points?: number;
          sort_order?: number;
          metadata?: Json;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          section_id?: string | null;
          exercise_type?: string;
          question?: string;
          instruction?: string | null;
          explanation?: string | null;
          correct_answer?: string | null;
          audio_url?: string | null;
          image_url?: string | null;
          points?: number;
          sort_order?: number;
          metadata?: Json;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      exercise_options: {
        Row: {
          id: string;
          exercise_id: string;
          option_text: string;
          translation: string | null;
          is_correct: boolean;
          sort_order: number;
          audio_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          exercise_id: string;
          option_text: string;
          translation?: string | null;
          is_correct?: boolean;
          sort_order?: number;
          audio_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          exercise_id?: string;
          option_text?: string;
          translation?: string | null;
          is_correct?: boolean;
          sort_order?: number;
          audio_url?: string | null;
          created_at?: string;
        };
      };
      vocabulary_items: {
        Row: {
          id: string;
          course_id: string;
          word: string;
          normalized_word: string;
          part_of_speech: string | null;
          pronunciation: string | null;
          audio_url: string | null;
          image_url: string | null;
          difficulty: string;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          word: string;
          normalized_word: string;
          part_of_speech?: string | null;
          pronunciation?: string | null;
          audio_url?: string | null;
          image_url?: string | null;
          difficulty?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          word?: string;
          normalized_word?: string;
          part_of_speech?: string | null;
          pronunciation?: string | null;
          audio_url?: string | null;
          image_url?: string | null;
          difficulty?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      vocabulary_translations: {
        Row: {
          id: string;
          vocabulary_item_id: string;
          language_id: string;
          translation: string;
          example_sentence: string | null;
          example_translation: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vocabulary_item_id: string;
          language_id: string;
          translation: string;
          example_sentence?: string | null;
          example_translation?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vocabulary_item_id?: string;
          language_id?: string;
          translation?: string;
          example_sentence?: string | null;
          example_translation?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      lesson_vocabulary: {
        Row: {
          id: string;
          lesson_id: string;
          vocabulary_item_id: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          vocabulary_item_id: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          vocabulary_item_id?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          display_name: string | null;
          avatar_url: string | null;
          native_language_id: string | null;
          learning_language_id: string | null;
          current_course_id: string | null;
          current_level_id: string | null;
          xp: number;
          current_streak: number;
          longest_streak: number;
          last_activity_at: string | null;
          onboarding_completed: boolean;
          is_active: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          native_language_id?: string | null;
          learning_language_id?: string | null;
          current_course_id?: string | null;
          current_level_id?: string | null;
          xp?: number;
          current_streak?: number;
          longest_streak?: number;
          last_activity_at?: string | null;
          onboarding_completed?: boolean;
          is_active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          native_language_id?: string | null;
          learning_language_id?: string | null;
          current_course_id?: string | null;
          current_level_id?: string | null;
          xp?: number;
          current_streak?: number;
          longest_streak?: number;
          last_activity_at?: string | null;
          onboarding_completed?: boolean;
          is_active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          daily_goal_minutes: number;
          daily_goal_xp: number;
          notifications_enabled: boolean;
          sound_enabled: boolean;
          haptic_enabled: boolean;
          preferred_timezone: string;
          app_language: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          daily_goal_minutes?: number;
          daily_goal_xp?: number;
          notifications_enabled?: boolean;
          sound_enabled?: boolean;
          haptic_enabled?: boolean;
          preferred_timezone?: string;
          app_language?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          daily_goal_minutes?: number;
          daily_goal_xp?: number;
          notifications_enabled?: boolean;
          sound_enabled?: boolean;
          haptic_enabled?: boolean;
          preferred_timezone?: string;
          app_language?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          daily_reminder: boolean;
          achievement_notifications: boolean;
          streak_notifications: boolean;
          subscription_notifications: boolean;
          marketing_notifications: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          daily_reminder?: boolean;
          achievement_notifications?: boolean;
          streak_notifications?: boolean;
          subscription_notifications?: boolean;
          marketing_notifications?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          daily_reminder?: boolean;
          achievement_notifications?: boolean;
          streak_notifications?: boolean;
          subscription_notifications?: boolean;
          marketing_notifications?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_course_enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          started_at: string;
          completed_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          started_at?: string;
          completed_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          started_at?: string;
          completed_at?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          status: string;
          progress_percentage: number;
          score: number | null;
          best_score: number | null;
          attempts: number;
          completed_at: string | null;
          last_accessed_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          status?: string;
          progress_percentage?: number;
          score?: number | null;
          best_score?: number | null;
          attempts?: number;
          completed_at?: string | null;
          last_accessed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          status?: string;
          progress_percentage?: number;
          score?: number | null;
          best_score?: number | null;
          attempts?: number;
          completed_at?: string | null;
          last_accessed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_exercise_progress: {
        Row: {
          id: string;
          user_id: string;
          exercise_id: string;
          is_completed: boolean;
          best_score: number | null;
          attempt_count: number;
          last_attempt_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exercise_id: string;
          is_completed?: boolean;
          best_score?: number | null;
          attempt_count?: number;
          last_attempt_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exercise_id?: string;
          is_completed?: boolean;
          best_score?: number | null;
          attempt_count?: number;
          last_attempt_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      exercise_attempts: {
        Row: {
          id: string;
          user_id: string;
          exercise_id: string;
          lesson_id: string | null;
          answer: string | null;
          is_correct: boolean;
          score: number | null;
          time_spent_seconds: number | null;
          attempted_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          exercise_id: string;
          lesson_id?: string | null;
          answer?: string | null;
          is_correct: boolean;
          score?: number | null;
          time_spent_seconds?: number | null;
          attempted_at?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          exercise_id?: string;
          lesson_id?: string | null;
          answer?: string | null;
          is_correct?: boolean;
          score?: number | null;
          time_spent_seconds?: number | null;
          attempted_at?: string;
          metadata?: Json;
        };
      };
      learning_sessions: {
        Row: {
          id: string;
          user_id: string;
          course_id: string | null;
          started_at: string;
          ended_at: string | null;
          duration_seconds: number;
          xp_earned: number;
          lessons_completed: number;
          exercises_completed: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id?: string | null;
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number;
          xp_earned?: number;
          lessons_completed?: number;
          exercises_completed?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string | null;
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number;
          xp_earned?: number;
          lessons_completed?: number;
          exercises_completed?: number;
          created_at?: string;
        };
      };
      xp_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          source: string;
          reference_type: string | null;
          reference_id: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          source: string;
          reference_type?: string | null;
          reference_id?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          source?: string;
          reference_type?: string | null;
          reference_id?: string | null;
          description?: string | null;
          created_at?: string;
        };
      };
      user_streaks: {
        Row: {
          id: string;
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_activity_date: string | null;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_daily_activity: {
        Row: {
          id: string;
          user_id: string;
          activity_date: string;
          minutes_learned: number;
          xp_earned: number;
          lessons_completed: number;
          exercises_completed: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_date: string;
          minutes_learned?: number;
          xp_earned?: number;
          lessons_completed?: number;
          exercises_completed?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_date?: string;
          minutes_learned?: number;
          xp_earned?: number;
          lessons_completed?: number;
          exercises_completed?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          code: string;
          title: string;
          description: string | null;
          icon_url: string | null;
          requirement_type: string;
          requirement_value: number;
          requirement_ref: string | null;
          xp_reward: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          title: string;
          description?: string | null;
          icon_url?: string | null;
          requirement_type: string;
          requirement_value: number;
          requirement_ref?: string | null;
          xp_reward?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          title?: string;
          description?: string | null;
          icon_url?: string | null;
          requirement_type?: string;
          requirement_value?: number;
          requirement_ref?: string | null;
          xp_reward?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
        };
      };
      review_items: {
        Row: {
          id: string;
          user_id: string;
          vocabulary_item_id: string;
          ease_factor: number;
          interval_days: number;
          repetition_count: number;
          next_review_at: string;
          last_reviewed_at: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          vocabulary_item_id: string;
          ease_factor?: number;
          interval_days?: number;
          repetition_count?: number;
          next_review_at?: string;
          last_reviewed_at?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          vocabulary_item_id?: string;
          ease_factor?: number;
          interval_days?: number;
          repetition_count?: number;
          next_review_at?: string;
          last_reviewed_at?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      review_attempts: {
        Row: {
          id: string;
          user_id: string;
          review_item_id: string;
          quality: number;
          previous_interval: number | null;
          new_interval: number | null;
          reviewed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          review_item_id: string;
          quality: number;
          previous_interval?: number | null;
          new_interval?: number | null;
          reviewed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          review_item_id?: string;
          quality?: number;
          previous_interval?: number | null;
          new_interval?: number | null;
          reviewed_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          provider_customer_id: string | null;
          provider_subscription_id: string | null;
          status: string;
          plan_id: string | null;
          trial_started_at: string | null;
          trial_ends_at: string | null;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: string;
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          status?: string;
          plan_id?: string | null;
          trial_started_at?: string | null;
          trial_ends_at?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: string;
          provider_customer_id?: string | null;
          provider_subscription_id?: string | null;
          status?: string;
          plan_id?: string | null;
          trial_started_at?: string | null;
          trial_ends_at?: string | null;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      entitlements: {
        Row: {
          id: string;
          user_id: string;
          entitlement: string;
          status: string;
          starts_at: string;
          expires_at: string | null;
          source: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entitlement: string;
          status: string;
          starts_at?: string;
          expires_at?: string | null;
          source: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entitlement?: string;
          status?: string;
          starts_at?: string;
          expires_at?: string | null;
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscription_events: {
        Row: {
          id: string;
          provider: string;
          event_id: string;
          event_type: string;
          subscription_id: string | null;
          payload: Json;
          processed: boolean;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider: string;
          event_id: string;
          event_type: string;
          subscription_id?: string | null;
          payload?: Json;
          processed?: boolean;
          processed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider?: string;
          event_id?: string;
          event_type?: string;
          subscription_id?: string | null;
          payload?: Json;
          processed?: boolean;
          processed_at?: string | null;
          created_at?: string;
        };
      };
      device_tokens: {
        Row: {
          id: string;
          user_id: string;
          device_id: string;
          platform: string;
          push_token: string;
          is_active: boolean;
          last_seen_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          device_id: string;
          platform: string;
          push_token: string;
          is_active?: boolean;
          last_seen_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          device_id?: string;
          platform?: string;
          push_token?: string;
          is_active?: boolean;
          last_seen_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      media_assets: {
        Row: {
          id: string;
          type: string;
          storage_path: string;
          public_url: string | null;
          mime_type: string | null;
          file_size: number | null;
          duration_seconds: number | null;
          metadata: Json;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          storage_path: string;
          public_url?: string | null;
          mime_type?: string | null;
          file_size?: number | null;
          duration_seconds?: number | null;
          metadata?: Json;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          storage_path?: string;
          public_url?: string | null;
          mime_type?: string | null;
          file_size?: number | null;
          duration_seconds?: number | null;
          metadata?: Json;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_downloads: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          content_version: number;
          downloaded_at: string;
          last_synced_at: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          content_version?: number;
          downloaded_at?: string;
          last_synced_at?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          content_version?: number;
          downloaded_at?: string;
          last_synced_at?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      sync_events: {
        Row: {
          id: string;
          user_id: string;
          device_id: string | null;
          idempotency_key: string;
          event_type: string;
          entity_type: string | null;
          entity_id: string | null;
          event_data: Json;
          client_created_at: string | null;
          server_received_at: string;
          processed_at: string | null;
          status: string;
          error_message: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          device_id?: string | null;
          idempotency_key: string;
          event_type: string;
          entity_type?: string | null;
          entity_id?: string | null;
          event_data?: Json;
          client_created_at?: string | null;
          server_received_at?: string;
          processed_at?: string | null;
          status?: string;
          error_message?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          device_id?: string | null;
          idempotency_key?: string;
          event_type?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          event_data?: Json;
          client_created_at?: string | null;
          server_received_at?: string;
          processed_at?: string | null;
          status?: string;
          error_message?: string | null;
        };
      };
      learning_events: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          entity_type: string | null;
          entity_id: string | null;
          metadata: Json;
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          entity_type?: string | null;
          entity_id?: string | null;
          metadata?: Json;
          occurred_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          metadata?: Json;
          occurred_at?: string;
          created_at?: string;
        };
      };
    };
  };
}
