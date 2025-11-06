/*
  # Enhanced Wellness Features
  
  1. New Tables
    - `mood_entries` - Detailed mood tracking over time
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `mood_score` (integer, 1-10) - Overall mood rating
      - `emotions` (text[]) - Array of emotion tags
      - `energy_level` (integer, 1-10)
      - `stress_level` (integer, 1-10)
      - `notes` (text, nullable)
      - `triggers` (text[], nullable) - What affected mood
      - `recorded_at` (timestamptz)
      - `created_at` (timestamptz)
    
    - `journal_entries` - Text-based journaling
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `title` (text)
      - `content` (text)
      - `mood_before` (integer, 1-10, nullable)
      - `mood_after` (integer, 1-10, nullable)
      - `tags` (text[])
      - `is_private` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `voice_journals` - Voice recording journaling
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `title` (text)
      - `audio_url` (text) - URL to audio file
      - `duration_seconds` (integer)
      - `transcription` (text, nullable)
      - `mood_detected` (text, nullable)
      - `tags` (text[])
      - `created_at` (timestamptz)
    
    - `ai_insights` - AI-generated wellness insights
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `insight_type` (text) - pattern/recommendation/trend/alert
      - `title` (text)
      - `content` (text)
      - `confidence_score` (numeric) - 0-1
      - `data_sources` (text[]) - What data was analyzed
      - `action_items` (text[], nullable)
      - `is_read` (boolean)
      - `generated_at` (timestamptz)
      - `created_at` (timestamptz)
    
    - `mindfulness_sessions` - Guided mindfulness practice
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `session_type` (text) - meditation/breathing/body-scan/visualization
      - `duration_minutes` (integer)
      - `mood_before` (integer, 1-10, nullable)
      - `mood_after` (integer, 1-10, nullable)
      - `focus_quality` (integer, 1-10, nullable)
      - `notes` (text, nullable)
      - `completed` (boolean)
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz, nullable)
      - `created_at` (timestamptz)
    
    - `reminders` - User reminders and notifications
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `reminder_type` (text) - activity/journal/mood-check/mindfulness
      - `title` (text)
      - `message` (text)
      - `scheduled_time` (time)
      - `days_of_week` (integer[]) - 0-6 (Sunday-Saturday)
      - `is_active` (boolean)
      - `last_sent_at` (timestamptz, nullable)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Users can only manage their own data
*/

-- Create mood_entries table
CREATE TABLE IF NOT EXISTS mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_score integer NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  emotions text[] DEFAULT '{}',
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
  stress_level integer CHECK (stress_level >= 1 AND stress_level <= 10),
  notes text,
  triggers text[],
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mood entries"
  ON mood_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood entries"
  ON mood_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood entries"
  ON mood_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood entries"
  ON mood_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  mood_before integer CHECK (mood_before >= 1 AND mood_before <= 10),
  mood_after integer CHECK (mood_after >= 1 AND mood_after <= 10),
  tags text[] DEFAULT '{}',
  is_private boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journal entries"
  ON journal_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON journal_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON journal_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create voice_journals table
CREATE TABLE IF NOT EXISTS voice_journals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  audio_url text NOT NULL,
  duration_seconds integer NOT NULL CHECK (duration_seconds > 0),
  transcription text,
  mood_detected text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE voice_journals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own voice journals"
  ON voice_journals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voice journals"
  ON voice_journals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own voice journals"
  ON voice_journals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own voice journals"
  ON voice_journals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create ai_insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type text NOT NULL CHECK (insight_type IN ('pattern', 'recommendation', 'trend', 'alert')),
  title text NOT NULL,
  content text NOT NULL,
  confidence_score numeric CHECK (confidence_score >= 0 AND confidence_score <= 1),
  data_sources text[] DEFAULT '{}',
  action_items text[],
  is_read boolean DEFAULT false,
  generated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai insights"
  ON ai_insights FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own ai insights"
  ON ai_insights FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create mindfulness_sessions table
CREATE TABLE IF NOT EXISTS mindfulness_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type text NOT NULL CHECK (session_type IN ('meditation', 'breathing', 'body-scan', 'visualization')),
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  mood_before integer CHECK (mood_before >= 1 AND mood_before <= 10),
  mood_after integer CHECK (mood_after >= 1 AND mood_after <= 10),
  focus_quality integer CHECK (focus_quality >= 1 AND focus_quality <= 10),
  notes text,
  completed boolean DEFAULT false,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mindfulness_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mindfulness sessions"
  ON mindfulness_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mindfulness sessions"
  ON mindfulness_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mindfulness sessions"
  ON mindfulness_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own mindfulness sessions"
  ON mindfulness_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type text NOT NULL CHECK (reminder_type IN ('activity', 'journal', 'mood-check', 'mindfulness')),
  title text NOT NULL,
  message text NOT NULL,
  scheduled_time time NOT NULL,
  days_of_week integer[] DEFAULT '{0,1,2,3,4,5,6}',
  is_active boolean DEFAULT true,
  last_sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON reminders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mood_entries_user ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_recorded_at ON mood_entries(recorded_at);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_voice_journals_user ON voice_journals(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_is_read ON ai_insights(is_read);
CREATE INDEX IF NOT EXISTS idx_mindfulness_sessions_user ON mindfulness_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mindfulness_sessions_started_at ON mindfulness_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_active ON reminders(is_active);

-- Trigger for journal_entries updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_journal_entries_updated_at'
  ) THEN
    CREATE TRIGGER update_journal_entries_updated_at
      BEFORE UPDATE ON journal_entries
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;