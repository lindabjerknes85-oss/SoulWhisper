/*
  # Fill Missing Features from Netlify Migrations
  
  This migration adds all features from Netlify that are missing in the current database.
  
  1. New Tables - Community Features
    - `support_groups` - Specialized support groups by category
      - `id` (uuid, primary key)
      - `name` (text) - Group name
      - `description` (text)
      - `category` (text) - Anxiety/Depression/Sleep/Stress/etc
      - `member_count` (integer) - Auto-updated member count
      - `is_anonymous` (boolean) - Allow anonymous participation
      - `created_at` (timestamptz)
    
    - `group_messages` - Messages within groups
      - `id` (uuid, primary key)
      - `group_id` (uuid) - Reference to support_groups
      - `user_id` (uuid) - Reference to auth.users
      - `message_text` (text)
      - `is_anonymous` (boolean) - Posted anonymously
      - `likes_count` (integer) - Auto-updated like count
      - `created_at` (timestamptz)
    
    - `message_likes` - Track likes on messages
      - `id` (uuid, primary key)
      - `message_id` (uuid) - Reference to group_messages
      - `user_id` (uuid) - Reference to auth.users
      - `created_at` (timestamptz)
    
    - `user_milestones` - Track and share user milestones
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `milestone_type` (text) - streak_7/streak_30/first_activity/etc
      - `title` (text) - Milestone title
      - `description` (text)
      - `is_public` (boolean) - Share publicly
      - `likes_count` (integer) - Auto-updated like count
      - `achieved_at` (timestamptz)
  
  2. New Tables - Enhanced Gamification
    - `user_progress` - Detailed progress tracking
      - `id` (uuid, primary key)
      - `user_id` (uuid, unique) - Reference to auth.users
      - `total_activities` (integer)
      - `current_streak` (integer)
      - `longest_streak` (integer)
      - `total_points` (integer)
      - `level` (integer)
      - `badges_earned` (jsonb) - Array of badge IDs
      - `last_activity_date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `completed_challenges` - Track completed challenges
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `challenge_id` (uuid) - Reference to wellness_challenges
      - `completed_at` (timestamptz)
      - `points_earned` (integer)
      - `completion_note` (text, nullable)
  
  3. New Tables - Professional Integration
    - `therapist_access` - Grant therapists access to user data
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users (patient)
      - `therapist_email` (text) - Therapist email
      - `access_level` (text) - read_only/full_access
      - `granted_at` (timestamptz)
      - `expires_at` (timestamptz, nullable)
      - `revoked_at` (timestamptz, nullable)
    
    - `appointments` - Appointment scheduling system
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `therapist_email` (text)
      - `appointment_date` (timestamptz)
      - `duration_minutes` (integer)
      - `appointment_type` (text) - initial/followup/emergency
      - `status` (text) - scheduled/completed/cancelled
      - `notes` (text, nullable)
      - `created_at` (timestamptz)
  
  4. New Tables - Wearable Integration
    - `wearable_connections` - Connected wearable devices
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `device_type` (text) - apple_watch/fitbit/garmin/etc
      - `device_name` (text)
      - `connection_status` (text) - active/disconnected
      - `last_sync` (timestamptz)
      - `connected_at` (timestamptz)
    
    - `wearable_data` - Data synced from wearables
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `connection_id` (uuid) - Reference to wearable_connections
      - `data_type` (text) - steps/heart_rate/sleep/calories/etc
      - `value` (numeric) - Numeric value
      - `unit` (text) - steps/bpm/minutes/kcal
      - `recorded_at` (timestamptz) - When data was recorded
      - `synced_at` (timestamptz) - When data was synced
  
  5. Helper Functions
    - `increment_group_members()` - Auto-update member count
    - `increment_message_likes()` - Auto-update message likes
    - `increment_milestone_likes()` - Auto-update milestone likes
  
  6. Security
    - Enable RLS on all tables
    - Appropriate policies for each table
    - Privacy-aware sharing controls
*/

-- ======================
-- COMMUNITY FEATURES
-- ======================

-- Create support_groups table
CREATE TABLE IF NOT EXISTS support_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('Anxiety', 'Depression', 'Sleep', 'Stress', 'Mindfulness', 'Nutrition', 'Exercise', 'Relationships')),
  member_count integer DEFAULT 0,
  is_anonymous boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE support_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view support groups"
  ON support_groups FOR SELECT
  TO authenticated
  USING (true);

-- Create group_messages table
CREATE TABLE IF NOT EXISTS group_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES support_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_text text NOT NULL,
  is_anonymous boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view group messages"
  ON group_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can post messages"
  ON group_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages"
  ON group_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
  ON group_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create message_likes table
CREATE TABLE IF NOT EXISTS message_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES group_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(message_id, user_id)
);

ALTER TABLE message_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view message likes"
  ON message_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like messages"
  ON message_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike messages"
  ON message_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create user_milestones table
CREATE TABLE IF NOT EXISTS user_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_type text NOT NULL CHECK (milestone_type IN ('streak_7', 'streak_30', 'streak_100', 'first_activity', 'activities_50', 'activities_100', 'all_dimensions')),
  title text NOT NULL,
  description text NOT NULL,
  is_public boolean DEFAULT true,
  likes_count integer DEFAULT 0,
  achieved_at timestamptz DEFAULT now()
);

ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones"
  ON user_milestones FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public milestones"
  ON user_milestones FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "System can insert milestones"
  ON user_milestones FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create milestone_likes table
CREATE TABLE IF NOT EXISTS milestone_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES user_milestones(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(milestone_id, user_id)
);

ALTER TABLE milestone_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view milestone likes"
  ON milestone_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can like milestones"
  ON milestone_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike milestones"
  ON milestone_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ======================
-- ENHANCED GAMIFICATION
-- ======================

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_activities integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  total_points integer DEFAULT 0,
  level integer DEFAULT 1,
  badges_earned jsonb DEFAULT '[]'::jsonb,
  last_activity_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view others progress if public"
  ON user_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_preferences
      WHERE user_preferences.user_id = user_progress.user_id
      AND user_preferences.privacy_level IN ('public', 'friends')
    )
  );

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create completed_challenges table
CREATE TABLE IF NOT EXISTS completed_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES wellness_challenges(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  points_earned integer DEFAULT 0,
  completion_note text,
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE completed_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completed challenges"
  ON completed_challenges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completed challenges"
  ON completed_challenges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ======================
-- PROFESSIONAL INTEGRATION
-- ======================

-- Create therapist_access table
CREATE TABLE IF NOT EXISTS therapist_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  therapist_email text NOT NULL,
  access_level text NOT NULL CHECK (access_level IN ('read_only', 'full_access')),
  granted_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  revoked_at timestamptz
);

ALTER TABLE therapist_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own therapist access"
  ON therapist_access FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can grant therapist access"
  ON therapist_access FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own therapist access"
  ON therapist_access FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can revoke therapist access"
  ON therapist_access FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  therapist_email text NOT NULL,
  appointment_date timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  appointment_type text NOT NULL CHECK (appointment_type IN ('initial', 'followup', 'emergency')),
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ======================
-- WEARABLE INTEGRATION
-- ======================

-- Create wearable_connections table
CREATE TABLE IF NOT EXISTS wearable_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_type text NOT NULL CHECK (device_type IN ('apple_watch', 'fitbit', 'garmin', 'samsung_health', 'google_fit')),
  device_name text NOT NULL,
  connection_status text DEFAULT 'active' CHECK (connection_status IN ('active', 'disconnected')),
  last_sync timestamptz,
  connected_at timestamptz DEFAULT now()
);

ALTER TABLE wearable_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wearable connections"
  ON wearable_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add wearable connections"
  ON wearable_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections"
  ON wearable_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections"
  ON wearable_connections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create wearable_data table
CREATE TABLE IF NOT EXISTS wearable_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_id uuid NOT NULL REFERENCES wearable_connections(id) ON DELETE CASCADE,
  data_type text NOT NULL CHECK (data_type IN ('steps', 'heart_rate', 'sleep', 'calories', 'distance', 'active_minutes', 'resting_heart_rate')),
  value numeric NOT NULL,
  unit text NOT NULL,
  recorded_at timestamptz NOT NULL,
  synced_at timestamptz DEFAULT now()
);

ALTER TABLE wearable_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wearable data"
  ON wearable_data FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert wearable data"
  ON wearable_data FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ======================
-- HELPER FUNCTIONS
-- ======================

-- Function to increment group member count
CREATE OR REPLACE FUNCTION increment_group_members()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE support_groups
    SET member_count = member_count + 1
    WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE support_groups
    SET member_count = GREATEST(0, member_count - 1)
    WHERE id = OLD.group_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger would be applied to a group_members_support table
-- Since we're using the existing group_members table, we skip the trigger creation

-- Function to increment message likes
CREATE OR REPLACE FUNCTION increment_message_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE group_messages
    SET likes_count = likes_count + 1
    WHERE id = NEW.message_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE group_messages
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.message_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for message likes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_increment_message_likes_insert'
  ) THEN
    CREATE TRIGGER trigger_increment_message_likes_insert
      AFTER INSERT ON message_likes
      FOR EACH ROW
      EXECUTE FUNCTION increment_message_likes();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_increment_message_likes_delete'
  ) THEN
    CREATE TRIGGER trigger_increment_message_likes_delete
      AFTER DELETE ON message_likes
      FOR EACH ROW
      EXECUTE FUNCTION increment_message_likes();
  END IF;
END $$;

-- Function to increment milestone likes
CREATE OR REPLACE FUNCTION increment_milestone_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_milestones
    SET likes_count = likes_count + 1
    WHERE id = NEW.milestone_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_milestones
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.milestone_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for milestone likes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_increment_milestone_likes_insert'
  ) THEN
    CREATE TRIGGER trigger_increment_milestone_likes_insert
      AFTER INSERT ON milestone_likes
      FOR EACH ROW
      EXECUTE FUNCTION increment_milestone_likes();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_increment_milestone_likes_delete'
  ) THEN
    CREATE TRIGGER trigger_increment_milestone_likes_delete
      AFTER DELETE ON milestone_likes
      FOR EACH ROW
      EXECUTE FUNCTION increment_milestone_likes();
  END IF;
END $$;

-- Trigger for updated_at on user_progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_progress_updated_at'
  ) THEN
    CREATE TRIGGER update_user_progress_updated_at
      BEFORE UPDATE ON user_progress
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ======================
-- INDEXES
-- ======================

CREATE INDEX IF NOT EXISTS idx_support_groups_category ON support_groups(category);
CREATE INDEX IF NOT EXISTS idx_group_messages_group ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_user ON group_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_message_likes_message ON message_likes(message_id);
CREATE INDEX IF NOT EXISTS idx_user_milestones_user ON user_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_user_milestones_type ON user_milestones(milestone_type);
CREATE INDEX IF NOT EXISTS idx_milestone_likes_milestone ON milestone_likes(milestone_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_completed_challenges_user ON completed_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_completed_challenges_challenge ON completed_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_therapist_access_user ON therapist_access(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_wearable_connections_user ON wearable_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_wearable_data_user ON wearable_data(user_id);
CREATE INDEX IF NOT EXISTS idx_wearable_data_connection ON wearable_data(connection_id);
CREATE INDEX IF NOT EXISTS idx_wearable_data_recorded_at ON wearable_data(recorded_at);

-- ======================
-- SEED DATA
-- ======================

-- Seed support groups
INSERT INTO support_groups (name, description, category, is_anonymous) VALUES
  ('Anxiety Support Circle', 'A safe space to share experiences and coping strategies for anxiety', 'Anxiety', true),
  ('Depression Support Network', 'Connect with others navigating depression and recovery', 'Depression', true),
  ('Better Sleep Community', 'Share tips and support for improving sleep quality', 'Sleep', true),
  ('Stress Management Group', 'Learn and practice stress reduction techniques together', 'Stress', true),
  ('Mindful Living', 'Daily mindfulness practice and meditation support', 'Mindfulness', true),
  ('Nutrition & Wellness', 'Healthy eating habits and nutritional support', 'Nutrition', false)
ON CONFLICT DO NOTHING;