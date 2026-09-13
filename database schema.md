## Table `user_roles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `role` | `app_role` |  |
| `created_at` | `timestamptz` |  |

## Table `languages`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `code` | `text` |  Unique |
| `name` | `text` |  |
| `native_name` | `text` |  |
| `is_active` | `bool` |  |
| `created_at` | `timestamptz` |  |

## Table `language_pairs`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `source_language_id` | `uuid` |  |
| `target_language_id` | `uuid` |  |
| `is_active` | `bool` |  |
| `created_at` | `timestamptz` |  |

## Table `courses`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `language_pair_id` | `uuid` |  |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `slug` | `text` |  Unique |
| `image_url` | `text` |  Nullable |
| `is_published` | `bool` |  |
| `sort_order` | `int4` |  |
| `deleted_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `course_levels`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `course_id` | `uuid` |  |
| `code` | `text` |  |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `sort_order` | `int4` |  |
| `is_locked` | `bool` |  |
| `is_published` | `bool` |  |
| `deleted_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `learning_paths`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `course_level_id` | `uuid` |  |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `sort_order` | `int4` |  |
| `is_published` | `bool` |  |
| `deleted_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `modules`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `learning_path_id` | `uuid` |  |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `slug` | `text` |  Unique |
| `sort_order` | `int4` |  |
| `image_url` | `text` |  Nullable |
| `is_published` | `bool` |  |
| `deleted_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `lessons`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `module_id` | `uuid` |  |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `slug` | `text` |  Unique |
| `lesson_type` | `text` |  |
| `estimated_minutes` | `int4` |  |
| `xp_reward` | `int4` |  |
| `sort_order` | `int4` |  |
| `is_free` | `bool` |  |
| `is_published` | `bool` |  |
| `deleted_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `lesson_prerequisites`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `lesson_id` | `uuid` |  |
| `prerequisite_lesson_id` | `uuid` |  |
| `created_at` | `timestamptz` |  |

## Table `lesson_sections`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `lesson_id` | `uuid` |  |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `sort_order` | `int4` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `exercises`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `lesson_id` | `uuid` |  |
| `section_id` | `uuid` |  Nullable |
| `exercise_type` | `text` |  |
| `question` | `text` |  |
| `instruction` | `text` |  Nullable |
| `explanation` | `text` |  Nullable |
| `correct_answer` | `text` |  Nullable |
| `audio_url` | `text` |  Nullable |
| `image_url` | `text` |  Nullable |
| `points` | `int4` |  |
| `sort_order` | `int4` |  |
| `metadata` | `jsonb` |  |
| `deleted_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `exercise_options`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `exercise_id` | `uuid` |  |
| `option_text` | `text` |  |
| `translation` | `text` |  Nullable |
| `is_correct` | `bool` |  |
| `sort_order` | `int4` |  |
| `audio_url` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `vocabulary_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `course_id` | `uuid` |  |
| `word` | `text` |  |
| `normalized_word` | `text` |  |
| `part_of_speech` | `text` |  Nullable |
| `pronunciation` | `text` |  Nullable |
| `audio_url` | `text` |  Nullable |
| `image_url` | `text` |  Nullable |
| `difficulty` | `text` |  |
| `deleted_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `vocabulary_translations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `vocabulary_item_id` | `uuid` |  |
| `language_id` | `uuid` |  |
| `translation` | `text` |  |
| `example_sentence` | `text` |  Nullable |
| `example_translation` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `lesson_vocabulary`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `lesson_id` | `uuid` |  |
| `vocabulary_item_id` | `uuid` |  |
| `sort_order` | `int4` |  |
| `created_at` | `timestamptz` |  |

## Table `profiles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `full_name` | `text` |  Nullable |
| `display_name` | `text` |  Nullable |
| `avatar_url` | `text` |  Nullable |
| `native_language_id` | `uuid` |  Nullable |
| `learning_language_id` | `uuid` |  Nullable |
| `current_course_id` | `uuid` |  Nullable |
| `current_level_id` | `uuid` |  Nullable |
| `xp` | `int4` |  |
| `current_streak` | `int4` |  |
| `longest_streak` | `int4` |  |
| `last_activity_at` | `timestamptz` |  Nullable |
| `onboarding_completed` | `bool` |  |
| `is_active` | `bool` |  |
| `deleted_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `user_preferences`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Unique |
| `daily_goal_minutes` | `int4` |  |
| `daily_goal_xp` | `int4` |  |
| `notifications_enabled` | `bool` |  |
| `sound_enabled` | `bool` |  |
| `haptic_enabled` | `bool` |  |
| `preferred_timezone` | `text` |  |
| `app_language` | `text` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `notification_preferences`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Unique |
| `daily_reminder` | `bool` |  |
| `achievement_notifications` | `bool` |  |
| `streak_notifications` | `bool` |  |
| `subscription_notifications` | `bool` |  |
| `marketing_notifications` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `user_course_enrollments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `course_id` | `uuid` |  |
| `started_at` | `timestamptz` |  |
| `completed_at` | `timestamptz` |  Nullable |
| `is_active` | `bool` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `user_lesson_progress`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `lesson_id` | `uuid` |  |
| `status` | `text` |  |
| `progress_percentage` | `int4` |  |
| `score` | `int4` |  Nullable |
| `best_score` | `int4` |  Nullable |
| `attempts` | `int4` |  |
| `completed_at` | `timestamptz` |  Nullable |
| `last_accessed_at` | `timestamptz` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `user_exercise_progress`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `exercise_id` | `uuid` |  |
| `is_completed` | `bool` |  |
| `best_score` | `int4` |  Nullable |
| `attempt_count` | `int4` |  |
| `last_attempt_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `exercise_attempts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `exercise_id` | `uuid` |  |
| `lesson_id` | `uuid` |  Nullable |
| `answer` | `text` |  Nullable |
| `is_correct` | `bool` |  |
| `score` | `int4` |  Nullable |
| `time_spent_seconds` | `int4` |  Nullable |
| `attempted_at` | `timestamptz` |  |
| `metadata` | `jsonb` |  |

## Table `learning_sessions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `course_id` | `uuid` |  Nullable |
| `started_at` | `timestamptz` |  |
| `ended_at` | `timestamptz` |  Nullable |
| `duration_seconds` | `int4` |  |
| `xp_earned` | `int4` |  |
| `lessons_completed` | `int4` |  |
| `exercises_completed` | `int4` |  |
| `created_at` | `timestamptz` |  |

## Table `xp_transactions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `amount` | `int4` |  |
| `source` | `text` |  |
| `reference_type` | `text` |  Nullable |
| `reference_id` | `uuid` |  Nullable |
| `description` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `user_streaks`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  Unique |
| `current_streak` | `int4` |  |
| `longest_streak` | `int4` |  |
| `last_activity_date` | `date` |  Nullable |
| `timezone` | `text` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `user_daily_activity`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `activity_date` | `date` |  |
| `minutes_learned` | `int4` |  |
| `xp_earned` | `int4` |  |
| `lessons_completed` | `int4` |  |
| `exercises_completed` | `int4` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `achievements`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `code` | `text` |  Unique |
| `title` | `text` |  |
| `description` | `text` |  Nullable |
| `icon_url` | `text` |  Nullable |
| `requirement_type` | `text` |  |
| `requirement_value` | `int4` |  |
| `requirement_ref` | `text` |  Nullable |
| `xp_reward` | `int4` |  |
| `is_active` | `bool` |  |
| `created_at` | `timestamptz` |  |

## Table `user_achievements`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `achievement_id` | `uuid` |  |
| `unlocked_at` | `timestamptz` |  |

## Table `review_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `vocabulary_item_id` | `uuid` |  |
| `ease_factor` | `numeric` |  |
| `interval_days` | `int4` |  |
| `repetition_count` | `int4` |  |
| `next_review_at` | `timestamptz` |  |
| `last_reviewed_at` | `timestamptz` |  Nullable |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `review_attempts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `review_item_id` | `uuid` |  |
| `quality` | `int2` |  |
| `previous_interval` | `int4` |  Nullable |
| `new_interval` | `int4` |  Nullable |
| `reviewed_at` | `timestamptz` |  |

## Table `subscriptions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `provider` | `text` |  |
| `provider_customer_id` | `text` |  Nullable |
| `provider_subscription_id` | `text` |  Nullable |
| `status` | `text` |  |
| `plan_id` | `text` |  Nullable |
| `trial_started_at` | `timestamptz` |  Nullable |
| `trial_ends_at` | `timestamptz` |  Nullable |
| `current_period_start` | `timestamptz` |  Nullable |
| `current_period_end` | `timestamptz` |  Nullable |
| `cancel_at_period_end` | `bool` |  |
| `cancelled_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `entitlements`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `entitlement` | `text` |  |
| `status` | `text` |  |
| `starts_at` | `timestamptz` |  |
| `expires_at` | `timestamptz` |  Nullable |
| `source` | `text` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `subscription_events`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `provider` | `text` |  |
| `event_id` | `text` |  |
| `event_type` | `text` |  |
| `subscription_id` | `uuid` |  Nullable |
| `payload` | `jsonb` |  |
| `processed` | `bool` |  |
| `processed_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |

## Table `device_tokens`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `device_id` | `text` |  |
| `platform` | `text` |  |
| `push_token` | `text` |  Unique |
| `is_active` | `bool` |  |
| `last_seen_at` | `timestamptz` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `media_assets`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `type` | `text` |  |
| `storage_path` | `text` |  Unique |
| `public_url` | `text` |  Nullable |
| `mime_type` | `text` |  Nullable |
| `file_size` | `int8` |  Nullable |
| `duration_seconds` | `numeric` |  Nullable |
| `metadata` | `jsonb` |  |
| `deleted_at` | `timestamptz` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `user_downloads`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `lesson_id` | `uuid` |  |
| `content_version` | `int4` |  |
| `downloaded_at` | `timestamptz` |  |
| `last_synced_at` | `timestamptz` |  Nullable |
| `status` | `text` |  |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `sync_events`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `device_id` | `text` |  Nullable |
| `idempotency_key` | `text` |  |
| `event_type` | `text` |  |
| `entity_type` | `text` |  Nullable |
| `entity_id` | `uuid` |  Nullable |
| `event_data` | `jsonb` |  |
| `client_created_at` | `timestamptz` |  Nullable |
| `server_received_at` | `timestamptz` |  |
| `processed_at` | `timestamptz` |  Nullable |
| `status` | `text` |  |
| `error_message` | `text` |  Nullable |

## Table `learning_events`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `user_id` | `uuid` |  |
| `event_type` | `text` |  |
| `entity_type` | `text` |  Nullable |
| `entity_id` | `uuid` |  Nullable |
| `metadata` | `jsonb` |  |
| `occurred_at` | `timestamptz` |  |
| `created_at` | `timestamptz` |  |

## Custom Types / Enums

### `app_role`

`admin` | `moderator` | `user`

## RLS Policies

### `user_roles`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `users read own roles` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |

### `languages`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admins manage languages` | ALL | authenticated | PERMISSIVE | `is_admin()` | `is_admin()` |
| `read active languages` | SELECT | anon, authenticated | PERMISSIVE | `is_active` | — |

### `language_pairs`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admins manage language_pairs` | ALL | authenticated | PERMISSIVE | `is_admin()` | `is_admin()` |
| `read active language pairs` | SELECT | anon, authenticated | PERMISSIVE | `is_active` | — |

### `courses`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admins manage courses` | ALL | authenticated | PERMISSIVE | `is_admin()` | `is_admin()` |
| `read published courses` | SELECT | anon, authenticated | PERMISSIVE | `(is_published AND (deleted_at IS NULL))` | — |

### `course_levels`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admins manage course_levels` | ALL | authenticated | PERMISSIVE | `is_admin()` | `is_admin()` |
| `read published levels` | SELECT | anon, authenticated | PERMISSIVE | `(is_published AND (deleted_at IS NULL) AND (EXISTS ( SELECT 1    FROM courses c   WHERE ((c.id = course_levels.course_id) AND c.is_published AND (c.deleted_at IS NULL)))))` | — |

### `learning_paths`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admins manage learning_paths` | ALL | authenticated | PERMISSIVE | `is_admin()` | `is_admin()` |
| `read published paths` | SELECT | anon, authenticated | PERMISSIVE | `(is_published AND (deleted_at IS NULL) AND (EXISTS ( SELECT 1    FROM course_levels l   WHERE ((l.id = learning_paths.course_level_id) AND l.is_published AND (l.deleted_at IS NULL)))))` | — |

### `modules`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admins manage modules` | ALL | authenticated | PERMISSIVE | `is_admin()` | `is_admin()` |
| `read published modules` | SELECT | anon, authenticated | PERMISSIVE | `(is_published AND (deleted_at IS NULL) AND (EXISTS ( SELECT 1    FROM learning_paths p   WHERE ((p.id = modules.learning_path_id) AND p.is_published AND (p.deleted_at IS NULL)))))` | — |

### `lessons`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admins manage lessons` | ALL | authenticated | PERMISSIVE | `is_admin()` | `is_admin()` |
| `read published lessons` | SELECT | anon, authenticated | PERMISSIVE | `(is_published AND (deleted_at IS NULL) AND (EXISTS ( SELECT 1    FROM modules m   WHERE ((m.id = lessons.module_id) AND m.is_published AND (m.deleted_at IS NULL)))))` | — |

### `lesson_prerequisites`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admins manage lesson_prerequisites` | ALL | authenticated | PERMISSIVE | `is_admin()` | `is_admin()` |
| `read published lesson prereqs` | SELECT | anon, authenticated | PERMISSIVE | `lesson_is_readable(lesson_id)` | — |

### `lesson_sections`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admins manage lesson_sections` | ALL | authenticated | PERMISSIVE | `is_admin()` | `is_admin()` |
| `read published lesson sections` | SELECT | anon, authenticated | PERMISSIVE | `lesson_is_readable(lesson_id)` | — |

### `exercises`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admins manage exercises` | ALL | authenticated | PERMISSIVE | `is_admin()` | `is_admin()` |
| `read published exercises` | SELECT | anon, authenticated | PERMISSIVE | `((deleted_at IS NULL) AND lesson_is_readable(lesson_id))` | — |

### `exercise_options`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admins manage exercise_options` | ALL | authenticated | PERMISSIVE | `is_admin()` | `is_admin()` |
| `read options of published exercises` | SELECT | anon, authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM exercises e   WHERE ((e.id = exercise_options.exercise_id) AND (e.deleted_at IS NULL) AND lesson_is_readable(e.lesson_id))))` | — |

### `vocabulary_items`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admins manage vocabulary_items` | ALL | authenticated | PERMISSIVE | `is_admin()` | `is_admin()` |
| `read vocabulary of published courses` | SELECT | anon, authenticated | PERMISSIVE | `((deleted_at IS NULL) AND (EXISTS ( SELECT 1    FROM courses c   WHERE ((c.id = vocabulary_items.course_id) AND c.is_published AND (c.deleted_at IS NULL)))))` | — |

### `vocabulary_translations`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admins manage vocabulary_translations` | ALL | authenticated | PERMISSIVE | `is_admin()` | `is_admin()` |
| `read vocabulary translations` | SELECT | anon, authenticated | PERMISSIVE | `(EXISTS ( SELECT 1    FROM vocabulary_items v   WHERE ((v.id = vocabulary_translations.vocabulary_item_id) AND (v.deleted_at IS NULL))))` | — |

### `lesson_vocabulary`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admins manage lesson_vocabulary` | ALL | authenticated | PERMISSIVE | `is_admin()` | `is_admin()` |
| `read published lesson vocabulary` | SELECT | anon, authenticated | PERMISSIVE | `lesson_is_readable(lesson_id)` | — |

### `profiles`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `own profile select` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = id)` | — |
| `own profile insert` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = id)` |
| `own profile update` | UPDATE | authenticated | PERMISSIVE | `(auth.uid() = id)` | `(auth.uid() = id)` |

### `user_preferences`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `own user_preferences select` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `own user_preferences insert` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `own user_preferences update` | UPDATE | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |

### `achievements`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `admins manage achievements` | ALL | authenticated | PERMISSIVE | `is_admin()` | `is_admin()` |
| `read active achievements` | SELECT | anon, authenticated | PERMISSIVE | `is_active` | — |

### `notification_preferences`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `own notification_preferences select` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `own notification_preferences insert` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `own notification_preferences update` | UPDATE | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |

### `user_course_enrollments`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `own user_course_enrollments select` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `own user_course_enrollments insert` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `own user_course_enrollments update` | UPDATE | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |

### `user_lesson_progress`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `own user_lesson_progress select` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `own user_lesson_progress insert` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `own user_lesson_progress update` | UPDATE | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |

### `user_exercise_progress`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `own user_exercise_progress select` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `own user_exercise_progress insert` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `own user_exercise_progress update` | UPDATE | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |

### `exercise_attempts`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `own exercise_attempts select` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `own exercise_attempts insert` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = user_id)` |

### `learning_sessions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `own learning_sessions select` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `own learning_sessions insert` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `own learning_sessions update` | UPDATE | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |

### `user_daily_activity`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `own user_daily_activity select` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `own user_daily_activity insert` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `own daily activity update` | UPDATE | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |

### `user_achievements`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `own user_achievements select` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |

### `xp_transactions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `own xp select` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |

### `user_streaks`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `own streak select` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |

### `review_items`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `own review_items select` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `own review items insert` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `own review items update` | UPDATE | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |

### `review_attempts`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `own review_attempts select` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `own review attempts insert` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = user_id)` |

### `subscriptions`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `own subscriptions select` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |

### `entitlements`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `own entitlements select` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |

### `media_assets`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `media read` | SELECT | anon, authenticated | PERMISSIVE | `(deleted_at IS NULL)` | — |
| `admins manage media` | ALL | authenticated | PERMISSIVE | `is_admin()` | `is_admin()` |

### `device_tokens`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `own device_tokens select` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `own device_tokens insert` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `own device_tokens update` | UPDATE | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |
| `own device_tokens delete` | DELETE | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |

### `user_downloads`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `own user_downloads select` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `own user_downloads insert` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = user_id)` |
| `own user_downloads update` | UPDATE | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | `(auth.uid() = user_id)` |
| `own user_downloads delete` | DELETE | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |

### `sync_events`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `own sync_events select` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `own sync_events insert` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = user_id)` |

### `learning_events`

| Policy | Command | Roles | Action | USING | WITH CHECK |
|--------|---------|-------|--------|-------|------------|
| `own learning_events select` | SELECT | authenticated | PERMISSIVE | `(auth.uid() = user_id)` | — |
| `own learning_events insert` | INSERT | authenticated | PERMISSIVE | — | `(auth.uid() = user_id)` |

