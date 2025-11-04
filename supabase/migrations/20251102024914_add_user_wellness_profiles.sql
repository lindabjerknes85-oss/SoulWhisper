/*
  # User Wellness Profiles
  
  1. New Tables
    - `user_profiles` - Extended user profile information
      - `id` (uuid, primary key, references auth.users)
      - `display_name` (text)
      - `avatar_url` (text, nullable)
      - `bio` (text, nullable)
      - `date_of_birth` (date, nullable)
      - `timezone` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `user_wellness_goals` - User-specific wellness goals
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `focus_area_id` (uuid) - Reference to wellness_focus_areas
      - `goal_type` (text) - Type of goal
      - `target_value` (numeric)
      - `current_value` (numeric)
      - `unit` (text)
      - `start_date` (date)
      - `target_date` (date)
      - `status` (text) - active/completed/paused
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `user_preferences` - User app preferences
      - `id` (uuid, primary key)
      - `user_id` (uuid, unique) - Reference to auth.users
      - `notification_enabled` (boolean)
      - `reminder_time` (time, nullable)
      - `privacy_level` (text) - public/friends/private
      - `preferred_focus_areas` (uuid[], array of focus_area_ids)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Users can only access and modify their own data
    - Public profiles viewable by all authenticated users
*/

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