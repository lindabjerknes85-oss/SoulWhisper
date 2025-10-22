/*
  # Add Wellness and Personal Development Features

  1. New Tables
    - `inspirations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text)
      - `content` (text, the inspirational quote or message)
      - `source` (text, optional source/author)
      - `category` (text, optional category)
      - `created_at` (timestamptz)

    - `affirmations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `affirmation` (text, the affirmation text)
      - `category` (text, category like 'success', 'health', 'confidence')
      - `times_used` (integer, track usage)
      - `last_used` (timestamptz, when last practiced)
      - `created_at` (timestamptz)

    - `meditations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text, meditation session title)
      - `duration_minutes` (integer, session length)
      - `meditation_type` (text, type like 'mindfulness', 'breathing', 'visualization')
      - `notes` (text, optional session notes)
      - `meditation_date` (date, when practiced)
      - `created_at` (timestamptz)

    - `workouts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text, workout name)
      - `workout_type` (text, type like 'cardio', 'strength', 'yoga', 'stretching')
      - `duration_minutes` (integer, workout length)
      - `intensity` (text, level like 'low', 'medium', 'high')
      - `calories_burned` (integer, optional)
      - `notes` (text, optional workout notes)
      - `workout_date` (date, when performed)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only read/write their own data
    - Policies for authenticated users to manage their own wellness data

  3. Indexes
    - Index on user_id for all tables for faster queries
    - Index on dates for filtering by time period
*/

-- Create inspirations table
CREATE TABLE IF NOT EXISTS inspirations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  source text,
  category text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create affirmations table
CREATE TABLE IF NOT EXISTS affirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  affirmation text NOT NULL,
  category text NOT NULL,
  times_used integer DEFAULT 0 NOT NULL,
  last_used timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create meditations table
CREATE TABLE IF NOT EXISTS meditations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  meditation_type text NOT NULL,
  notes text,
  meditation_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  workout_type text NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  intensity text NOT NULL CHECK (intensity IN ('low', 'medium', 'high')),
  calories_burned integer CHECK (calories_burned >= 0),
  notes text,
  workout_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE inspirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE affirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Inspirations policies
CREATE POLICY "Users can view own inspirations"
  ON inspirations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inspirations"
  ON inspirations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inspirations"
  ON inspirations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own inspirations"
  ON inspirations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Affirmations policies
CREATE POLICY "Users can view own affirmations"
  ON affirmations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own affirmations"
  ON affirmations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own affirmations"
  ON affirmations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own affirmations"
  ON affirmations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Meditations policies
CREATE POLICY "Users can view own meditations"
  ON meditations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meditations"
  ON meditations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meditations"
  ON meditations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meditations"
  ON meditations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Workouts policies
CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON workouts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workouts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS inspirations_user_id_idx ON inspirations(user_id);
CREATE INDEX IF NOT EXISTS affirmations_user_id_idx ON affirmations(user_id);
CREATE INDEX IF NOT EXISTS meditations_user_id_idx ON meditations(user_id);
CREATE INDEX IF NOT EXISTS meditations_date_idx ON meditations(meditation_date);
CREATE INDEX IF NOT EXISTS workouts_user_id_idx ON workouts(user_id);
CREATE INDEX IF NOT EXISTS workouts_date_idx ON workouts(workout_date);