/*
  # Wellness Categories and Programs
  
  1. New Tables
    - `wellness_categories` - Categorize wellness activities
      - `id` (uuid, primary key)
      - `name` (text) - Category name
      - `description` (text)
      - `focus_area_id` (uuid) - Reference to wellness_focus_areas
      - `created_at` (timestamptz)
    
    - `wellness_programs` - Structured wellness programs
      - `id` (uuid, primary key)
      - `title` (text) - Program title
      - `description` (text)
      - `duration_days` (integer) - Program length
      - `difficulty_level` (text) - beginner/intermediate/advanced
      - `focus_area_id` (uuid) - Reference to wellness_focus_areas
      - `is_active` (boolean)
      - `created_by` (uuid) - Reference to auth.users
      - `created_at` (timestamptz)
    
    - `program_activities` - Activities within programs
      - `id` (uuid, primary key)
      - `program_id` (uuid) - Reference to wellness_programs
      - `day_number` (integer) - Day in program
      - `title` (text) - Activity title
      - `description` (text)
      - `duration_minutes` (integer)
      - `category_id` (uuid) - Reference to wellness_categories
      - `created_at` (timestamptz)
    
    - `user_programs` - Track user program enrollment
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `program_id` (uuid) - Reference to wellness_programs
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz, nullable)
      - `current_day` (integer)
      - `status` (text) - active/completed/paused
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Public read access for programs and categories
    - Users can manage their own enrollments
*/

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