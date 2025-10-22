/*
  # Add Reflections and Future Visions

  1. New Tables
    - `reflections`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text, reflection title)
      - `what_went_well` (text, what was good)
      - `improvements` (text, what can be better)
      - `future_vision` (text, future goals and vision)
      - `category` (text, optional category like 'personal', 'business', 'health')
      - `reflection_date` (date, when this reflection was made)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on reflections table
    - Users can only read/write their own reflections
    - Policies for authenticated users to manage their own data

  3. Indexes
    - Index on user_id for faster queries
    - Index on reflection_date for filtering by time period
*/

-- Create reflections table
CREATE TABLE IF NOT EXISTS reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  what_went_well text NOT NULL,
  improvements text NOT NULL,
  future_vision text,
  category text,
  reflection_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

-- Reflections policies
CREATE POLICY "Users can view own reflections"
  ON reflections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections"
  ON reflections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections"
  ON reflections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections"
  ON reflections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS reflections_user_id_idx ON reflections(user_id);
CREATE INDEX IF NOT EXISTS reflections_date_idx ON reflections(reflection_date);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_reflections_updated_at ON reflections;
CREATE TRIGGER update_reflections_updated_at
  BEFORE UPDATE ON reflections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();