-- ==============================================================================
-- SOULWHISPER - COMPLETE DATABASE SETUP
-- ==============================================================================
-- This file contains ALL migrations from Bolt to be run in your Netlify/Supabase database
-- Run this entire file in your Supabase SQL Editor for database: ponsrmhpregvsxmxafwq
-- ==============================================================================

-- ==============================================================================
-- MIGRATION 1: Wellness Focus Areas & Metrics
-- ==============================================================================

-- Create wellness_focus_areas table
CREATE TABLE IF NOT EXISTS wellness_focus_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wellness_focus_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view focus areas"
  ON wellness_focus_areas FOR SELECT
  TO authenticated
  USING (true);

-- Create wellness_metrics table
CREATE TABLE IF NOT EXISTS wellness_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  focus_area_id uuid NOT NULL REFERENCES wellness_focus_areas(id) ON DELETE CASCADE,
  metric_type text NOT NULL,
  value numeric NOT NULL,
  unit text NOT NULL,
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wellness_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own metrics"
  ON wellness_metrics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metrics"
  ON wellness_metrics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metrics"
  ON wellness_metrics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own metrics"
  ON wellness_metrics FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wellness_metrics_user_id ON wellness_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_metrics_focus_area_id ON wellness_metrics(focus_area_id);
CREATE INDEX IF NOT EXISTS idx_wellness_metrics_recorded_at ON wellness_metrics(recorded_at);

-- Seed wellness focus areas
INSERT INTO wellness_focus_areas (name, description, icon, color) VALUES
  ('Physical Vitality', 'Build strength, endurance, and physical resilience through movement and exercise', 'activity', '#10b981'),
  ('Nutritional Balance', 'Nourish your body with wholesome foods and mindful eating habits', 'apple', '#f59e0b'),
  ('Mental Clarity', 'Enhance focus, cognitive function, and mental performance', 'brain', '#3b82f6'),
  ('Emotional Resilience', 'Develop emotional intelligence and stress management skills', 'heart', '#ec4899'),
  ('Social Connection', 'Foster meaningful relationships and community engagement', 'users', '#8b5cf6'),
  ('Purpose & Growth', 'Align with your values and pursue personal development', 'target', '#06b6d4'),
  ('Rest & Recovery', 'Prioritize quality sleep and restorative practices', 'moon', '#6366f1'),
  ('Environmental Harmony', 'Create supportive spaces and sustainable lifestyle practices', 'leaf', '#14b8a6')
ON CONFLICT (name) DO NOTHING;

-- ==============================================================================
-- MIGRATION 2: Wellness Categories & Programs
-- ==============================================================================

-- Create wellness_categories table
CREATE TABLE IF NOT EXISTS wellness_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  focus_area_id uuid NOT NULL REFERENCES wellness_focus_areas(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wellness_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON wellness_categories FOR SELECT
  TO authenticated
  USING (true);

-- Create wellness_programs table
CREATE TABLE IF NOT EXISTS wellness_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  duration_days integer NOT NULL,
  difficulty_level text NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  focus_area_id uuid NOT NULL REFERENCES wellness_focus_areas(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wellness_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active programs"
  ON wellness_programs FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create program_activities table
CREATE TABLE IF NOT EXISTS program_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES wellness_programs(id) ON DELETE CASCADE,
  day_number integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  duration_minutes integer NOT NULL,
  category_id uuid NOT NULL REFERENCES wellness_categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(program_id, day_number)
);

ALTER TABLE program_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view program activities"
  ON program_activities FOR SELECT
  TO authenticated
  USING (true);

-- Create user_programs table
CREATE TABLE IF NOT EXISTS user_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES wellness_programs(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  current_day integer DEFAULT 1,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, program_id)
);

ALTER TABLE user_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own program enrollments"
  ON user_programs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can enroll in programs"
  ON user_programs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own program enrollments"
  ON user_programs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own program enrollments"
  ON user_programs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wellness_categories_focus_area ON wellness_categories(focus_area_id);
CREATE INDEX IF NOT EXISTS idx_wellness_programs_focus_area ON wellness_programs(focus_area_id);
CREATE INDEX IF NOT EXISTS idx_program_activities_program ON program_activities(program_id);
CREATE INDEX IF NOT EXISTS idx_user_programs_user ON user_programs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_programs_status ON user_programs(status);

-- ==============================================================================
-- MIGRATION 3: Wellness Challenges
-- ==============================================================================

-- Create wellness_challenges table
CREATE TABLE IF NOT EXISTS wellness_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  focus_area_id uuid NOT NULL REFERENCES wellness_focus_areas(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  target_type text NOT NULL,
  target_value numeric NOT NULL,
  is_team_challenge boolean DEFAULT false,
  max_participants integer,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  CHECK (end_date >= start_date)
);

ALTER TABLE wellness_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenges"
  ON wellness_challenges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create challenges"
  ON wellness_challenges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Create challenge_participants table
CREATE TABLE IF NOT EXISTS challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES wellness_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_name text,
  joined_at timestamptz DEFAULT now(),
  progress numeric DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenge participants"
  ON challenge_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join challenges"
  ON challenge_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
  ON challenge_participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave challenges"
  ON challenge_participants FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create challenge_updates table
CREATE TABLE IF NOT EXISTS challenge_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES wellness_challenges(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES challenge_participants(id) ON DELETE CASCADE,
  value numeric NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE challenge_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenge updates"
  ON challenge_updates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Participants can add updates"
  ON challenge_updates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM challenge_participants
      WHERE challenge_participants.id = participant_id
      AND challenge_participants.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wellness_challenges_dates ON wellness_challenges(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_updates_participant ON challenge_updates(participant_id);

-- ==============================================================================
-- MIGRATION 4: User Profiles & Goals
-- ==============================================================================

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  avatar_url text,
  bio text,
  date_of_birth date,
  timezone text DEFAULT 'UTC',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create user_wellness_goals table
CREATE TABLE IF NOT EXISTS user_wellness_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  focus_area_id uuid NOT NULL REFERENCES wellness_focus_areas(id) ON DELETE CASCADE,
  goal_type text NOT NULL,
  target_value numeric NOT NULL,
  current_value numeric DEFAULT 0,
  unit text NOT NULL,
  start_date date DEFAULT CURRENT_DATE,
  target_date date NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (target_date >= start_date)
);

ALTER TABLE user_wellness_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
  ON user_wellness_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON user_wellness_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON user_wellness_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON user_wellness_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_enabled boolean DEFAULT true,
  reminder_time time,
  privacy_level text DEFAULT 'friends' CHECK (privacy_level IN ('public', 'friends', 'private')),
  preferred_focus_areas uuid[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_wellness_goals_user ON user_wellness_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wellness_goals_status ON user_wellness_goals(status);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON user_preferences(user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_user_profiles_updated_at
      BEFORE UPDATE ON user_profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_wellness_goals_updated_at'
  ) THEN
    CREATE TRIGGER update_user_wellness_goals_updated_at
      BEFORE UPDATE ON user_wellness_goals
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_preferences_updated_at'
  ) THEN
    CREATE TRIGGER update_user_preferences_updated_at
      BEFORE UPDATE ON user_preferences
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ==============================================================================
-- MIGRATION 5: Wellness Activities & Tracking
-- ==============================================================================

-- Create wellness_activities table
CREATE TABLE IF NOT EXISTS wellness_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES wellness_categories(id) ON DELETE CASCADE,
  focus_area_id uuid NOT NULL REFERENCES wellness_focus_areas(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  intensity_level text NOT NULL CHECK (intensity_level IN ('low', 'medium', 'high')),
  mood_before integer CHECK (mood_before >= 1 AND mood_before <= 10),
  mood_after integer CHECK (mood_after >= 1 AND mood_after <= 10),
  notes text,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wellness_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities"
  ON wellness_activities FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON wellness_activities FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON wellness_activities FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON wellness_activities FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create daily_wellness_summary table
CREATE TABLE IF NOT EXISTS daily_wellness_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  total_activities integer DEFAULT 0,
  total_minutes integer DEFAULT 0,
  focus_areas_engaged integer DEFAULT 0,
  overall_mood numeric,
  streak_days integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE daily_wellness_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own daily summaries"
  ON daily_wellness_summary FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily summaries"
  ON daily_wellness_summary FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily summaries"
  ON daily_wellness_summary FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create activity_reflections table
CREATE TABLE IF NOT EXISTS activity_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES wellness_activities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reflection_text text NOT NULL,
  insights text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reflections"
  ON activity_reflections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections"
  ON activity_reflections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections"
  ON activity_reflections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections"
  ON activity_reflections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wellness_activities_user ON wellness_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_activities_completed_at ON wellness_activities(completed_at);
CREATE INDEX IF NOT EXISTS idx_wellness_activities_focus_area ON wellness_activities(focus_area_id);
CREATE INDEX IF NOT EXISTS idx_daily_wellness_summary_user_date ON daily_wellness_summary(user_id, date);
CREATE INDEX IF NOT EXISTS idx_activity_reflections_activity ON activity_reflections(activity_id);

-- Trigger for updated_at on daily_wellness_summary
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_daily_wellness_summary_updated_at'
  ) THEN
    CREATE TRIGGER update_daily_wellness_summary_updated_at
      BEFORE UPDATE ON daily_wellness_summary
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ==============================================================================
-- MIGRATION 6: Gamification System
-- ==============================================================================

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL,
  rarity text NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points integer NOT NULL DEFAULT 0,
  criteria_type text NOT NULL,
  criteria_value numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  progress numeric DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view others achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_preferences
      WHERE user_preferences.user_id = user_achievements.user_id
      AND user_preferences.privacy_level IN ('public', 'friends')
    )
  );

CREATE POLICY "System can insert achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create user_points table
CREATE TABLE IF NOT EXISTS user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points integer DEFAULT 0,
  level integer DEFAULT 1,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points"
  ON user_points FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view others points if public"
  ON user_points FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_preferences
      WHERE user_preferences.user_id = user_points.user_id
      AND user_preferences.privacy_level IN ('public', 'friends')
    )
  );

CREATE POLICY "Users can insert own points"
  ON user_points FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own points"
  ON user_points FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create leaderboards table
CREATE TABLE IF NOT EXISTS leaderboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_type text NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'all-time')),
  period_start date NOT NULL,
  period_end date NOT NULL,
  points integer DEFAULT 0,
  rank integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, period_type, period_start)
);

ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboards"
  ON leaderboards FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_preferences
      WHERE user_preferences.user_id = leaderboards.user_id
      AND user_preferences.privacy_level = 'public'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_points_user ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total_points ON user_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboards_period ON leaderboards(period_type, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_leaderboards_rank ON leaderboards(rank);

-- Trigger for updated_at on user_points
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_points_updated_at'
  ) THEN
    CREATE TRIGGER update_user_points_updated_at
      BEFORE UPDATE ON user_points
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Seed some achievements
INSERT INTO achievements (name, description, icon, category, rarity, points, criteria_type, criteria_value) VALUES
  ('First Steps', 'Complete your first wellness activity', 'star', 'Getting Started', 'common', 10, 'activities_completed', 1),
  ('Week Warrior', 'Maintain a 7-day streak', 'flame', 'Consistency', 'rare', 50, 'streak_days', 7),
  ('Balanced Life', 'Engage with all 8 wellness dimensions in one week', 'target', 'Balance', 'epic', 100, 'focus_areas_week', 8),
  ('Century Club', 'Accumulate 100 total activities', 'trophy', 'Milestones', 'epic', 200, 'activities_completed', 100),
  ('Wellness Legend', 'Maintain a 30-day streak', 'crown', 'Mastery', 'legendary', 500, 'streak_days', 30)
ON CONFLICT (name) DO NOTHING;

-- ==============================================================================
-- MIGRATION 7: Social Features (CONTINUED IN NEXT SECTION...)
-- ==============================================================================
