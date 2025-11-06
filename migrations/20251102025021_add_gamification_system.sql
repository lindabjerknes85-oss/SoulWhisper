/*
  # Gamification System
  
  1. New Tables
    - `achievements` - Define achievements users can earn
      - `id` (uuid, primary key)
      - `name` (text) - Achievement name
      - `description` (text)
      - `icon` (text) - Icon identifier
      - `category` (text) - Achievement category
      - `rarity` (text) - common/rare/epic/legendary
      - `points` (integer) - Points awarded
      - `criteria_type` (text) - Type of criteria
      - `criteria_value` (numeric) - Target value
      - `created_at` (timestamptz)
    
    - `user_achievements` - Track earned achievements
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `achievement_id` (uuid) - Reference to achievements
      - `earned_at` (timestamptz)
      - `progress` (numeric) - Progress toward achievement
    
    - `user_points` - Track user points and levels
      - `id` (uuid, primary key)
      - `user_id` (uuid, unique) - Reference to auth.users
      - `total_points` (integer)
      - `level` (integer)
      - `current_streak` (integer) - Days in a row
      - `longest_streak` (integer)
      - `last_activity_date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `leaderboards` - Track rankings
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `period_type` (text) - daily/weekly/monthly/all-time
      - `period_start` (date)
      - `period_end` (date)
      - `points` (integer)
      - `rank` (integer)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Public read for achievements
    - Users manage their own points and achievements
    - Public read for leaderboards (privacy-aware)
*/

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