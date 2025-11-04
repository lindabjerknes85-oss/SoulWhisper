/*
  # Unique Wellness Features - Core Setup
  
  1. New Tables
    - `wellness_focus_areas` - Defines 8 unique wellness dimensions
      - `id` (uuid, primary key)
      - `name` (text) - Focus area name
      - `description` (text) - Detailed description
      - `icon` (text) - Icon identifier
      - `color` (text) - Theme color
      - `created_at` (timestamptz)
    
    - `wellness_metrics` - Track various wellness metrics
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `focus_area_id` (uuid) - Reference to wellness_focus_areas
      - `metric_type` (text) - Type of metric
      - `value` (numeric) - Metric value
      - `unit` (text) - Unit of measurement
      - `recorded_at` (timestamptz)
      - `created_at` (timestamptz)
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    
  3. Initial Data
    - Seed 8 unique wellness focus areas
*/

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