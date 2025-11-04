/*
  # Wellness Activities and Tracking
  
  1. New Tables
    - `wellness_activities` - Log individual wellness activities
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `category_id` (uuid) - Reference to wellness_categories
      - `focus_area_id` (uuid) - Reference to wellness_focus_areas
      - `title` (text) - Activity title
      - `description` (text, nullable)
      - `duration_minutes` (integer)
      - `intensity_level` (text) - low/medium/high
      - `mood_before` (integer, 1-10, nullable)
      - `mood_after` (integer, 1-10, nullable)
      - `notes` (text, nullable)
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)
    
    - `daily_wellness_summary` - Daily aggregate data
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `date` (date)
      - `total_activities` (integer)
      - `total_minutes` (integer)
      - `focus_areas_engaged` (integer)
      - `overall_mood` (numeric, nullable)
      - `streak_days` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `activity_reflections` - User reflections on activities
      - `id` (uuid, primary key)
      - `activity_id` (uuid) - Reference to wellness_activities
      - `user_id` (uuid) - Reference to auth.users
      - `reflection_text` (text)
      - `insights` (text[], array of insights)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Users can only manage their own activities and reflections
*/

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