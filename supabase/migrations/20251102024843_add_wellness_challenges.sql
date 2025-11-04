/*
  # Wellness Challenges
  
  1. New Tables
    - `wellness_challenges` - Define challenges
      - `id` (uuid, primary key)
      - `title` (text) - Challenge title
      - `description` (text)
      - `focus_area_id` (uuid) - Reference to wellness_focus_areas
      - `start_date` (date)
      - `end_date` (date)
      - `target_type` (text) - Type of target (steps, minutes, activities)
      - `target_value` (numeric) - Target to achieve
      - `is_team_challenge` (boolean) - Individual or team
      - `max_participants` (integer, nullable)
      - `created_by` (uuid) - Reference to auth.users
      - `created_at` (timestamptz)
    
    - `challenge_participants` - Track who joined challenges
      - `id` (uuid, primary key)
      - `challenge_id` (uuid) - Reference to wellness_challenges
      - `user_id` (uuid) - Reference to auth.users
      - `team_name` (text, nullable) - For team challenges
      - `joined_at` (timestamptz)
      - `progress` (numeric) - Current progress
      - `completed` (boolean)
      - `completed_at` (timestamptz, nullable)
    
    - `challenge_updates` - Activity updates for challenges
      - `id` (uuid, primary key)
      - `challenge_id` (uuid) - Reference to wellness_challenges
      - `participant_id` (uuid) - Reference to challenge_participants
      - `value` (numeric) - Progress increment
      - `note` (text, nullable)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Public read for challenges
    - Users manage their own participation
*/

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