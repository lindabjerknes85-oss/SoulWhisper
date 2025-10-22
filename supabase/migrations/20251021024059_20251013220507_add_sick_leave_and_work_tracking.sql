/*
  # Add Sick Leave and Work Tracking

  1. New Tables
    - `sick_leave`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `reason` (text, reason for sick leave)
      - `symptoms` (text, optional symptoms description)
      - `severity` (text, low/medium/high)
      - `start_date` (date, when sick leave started)
      - `end_date` (date, optional when sick leave ended)
      - `notes` (text, optional additional notes)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `work_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `project_name` (text, project or task name)
      - `description` (text, work description)
      - `hours_worked` (numeric, hours spent)
      - `work_type` (text, type like 'development', 'meeting', 'planning', 'design')
      - `status` (text, like 'in_progress', 'completed', 'blocked')
      - `work_date` (date, date of work)
      - `notes` (text, optional additional notes)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only read/write their own data
    - Policies for authenticated users to manage their own records

  3. Indexes
    - Index on user_id for faster queries
    - Index on dates for filtering by time period
*/

-- Create sick_leave table
CREATE TABLE IF NOT EXISTS sick_leave (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL,
  symptoms text,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create work_logs table
CREATE TABLE IF NOT EXISTS work_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_name text NOT NULL,
  description text NOT NULL,
  hours_worked numeric NOT NULL CHECK (hours_worked > 0),
  work_type text NOT NULL,
  status text DEFAULT 'in_progress' NOT NULL CHECK (status IN ('in_progress', 'completed', 'blocked')),
  work_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE sick_leave ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;

-- Sick leave policies
CREATE POLICY "Users can view own sick leave records"
  ON sick_leave FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sick leave records"
  ON sick_leave FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sick leave records"
  ON sick_leave FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sick leave records"
  ON sick_leave FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Work logs policies
CREATE POLICY "Users can view own work logs"
  ON work_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own work logs"
  ON work_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own work logs"
  ON work_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own work logs"
  ON work_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS sick_leave_user_id_idx ON sick_leave(user_id);
CREATE INDEX IF NOT EXISTS sick_leave_start_date_idx ON sick_leave(start_date);
CREATE INDEX IF NOT EXISTS work_logs_user_id_idx ON work_logs(user_id);
CREATE INDEX IF NOT EXISTS work_logs_work_date_idx ON work_logs(work_date);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_sick_leave_updated_at ON sick_leave;
CREATE TRIGGER update_sick_leave_updated_at
  BEFORE UPDATE ON sick_leave
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_work_logs_updated_at ON work_logs;
CREATE TRIGGER update_work_logs_updated_at
  BEFORE UPDATE ON work_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();