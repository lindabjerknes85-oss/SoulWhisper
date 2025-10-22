/*
  # Add Calendar and Planning Features

  1. New Tables
    - `calendar_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text, event title)
      - `description` (text, optional description)
      - `event_type` (text, type like 'task', 'meeting', 'goal', 'wellness', 'reflection')
      - `start_date` (timestamptz, event start)
      - `end_date` (timestamptz, optional event end)
      - `all_day` (boolean, is it all day event)
      - `color` (text, visual color code)
      - `status` (text, like 'planned', 'in_progress', 'completed', 'cancelled')
      - `priority` (text, like 'low', 'medium', 'high')
      - `reminder_minutes` (integer, minutes before to remind)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `year_wheel_goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `year` (integer, which year)
      - `quarter` (integer, which quarter 1-4)
      - `month` (integer, which month 1-12)
      - `category` (text, category like 'business', 'health', 'personal', 'finance')
      - `goal` (text, the goal description)
      - `status` (text, like 'not_started', 'in_progress', 'completed')
      - `notes` (text, optional notes)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only read/write their own data
    - Policies for authenticated users to manage their own calendar and goals

  3. Indexes
    - Index on user_id for all tables for faster queries
    - Index on dates for filtering by time period
    - Index on year for year wheel queries
*/

-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  event_type text NOT NULL DEFAULT 'task',
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  all_day boolean DEFAULT false NOT NULL,
  color text DEFAULT '#06b6d4',
  status text DEFAULT 'planned' NOT NULL CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  reminder_minutes integer,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create year_wheel_goals table
CREATE TABLE IF NOT EXISTS year_wheel_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  year integer NOT NULL,
  quarter integer CHECK (quarter >= 1 AND quarter <= 4),
  month integer CHECK (month >= 1 AND month <= 12),
  category text NOT NULL,
  goal text NOT NULL,
  status text DEFAULT 'not_started' NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE year_wheel_goals ENABLE ROW LEVEL SECURITY;

-- Calendar events policies
CREATE POLICY "Users can view own calendar events"
  ON calendar_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar events"
  ON calendar_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar events"
  ON calendar_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar events"
  ON calendar_events FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Year wheel goals policies
CREATE POLICY "Users can view own year wheel goals"
  ON year_wheel_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own year wheel goals"
  ON year_wheel_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own year wheel goals"
  ON year_wheel_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own year wheel goals"
  ON year_wheel_goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS calendar_events_user_id_idx ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS calendar_events_start_date_idx ON calendar_events(start_date);
CREATE INDEX IF NOT EXISTS calendar_events_status_idx ON calendar_events(status);
CREATE INDEX IF NOT EXISTS year_wheel_goals_user_id_idx ON year_wheel_goals(user_id);
CREATE INDEX IF NOT EXISTS year_wheel_goals_year_idx ON year_wheel_goals(year);

-- Create trigger for updated_at on calendar_events
DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON calendar_events;
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updated_at on year_wheel_goals
DROP TRIGGER IF EXISTS update_year_wheel_goals_updated_at ON year_wheel_goals;
CREATE TRIGGER update_year_wheel_goals_updated_at
  BEFORE UPDATE ON year_wheel_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();