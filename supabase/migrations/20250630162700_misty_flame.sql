/*
  # Create MVP Tables for Evolve AI

  1. New Tables
    - `mvp_activity_logs`
      - `id` (serial, primary key)
      - `user_id` (integer, foreign key to users)
      - `raw_text_input` (text, the original voice/text input)
      - `detected_intent` (text, AI-classified intent)
      - `extracted_keywords` (jsonb, keywords and metadata)
      - `timestamp` (timestamp, when activity occurred)
      - `created_at` (timestamp, when record was created)

  2. Updates to existing tables
    - Add `primary_wellness_goal` to users table

  3. Security
    - Enable RLS on `mvp_activity_logs` table
    - Add policies for authenticated users to manage their own data
*/

-- Add primary wellness goal to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'primary_wellness_goal'
  ) THEN
    ALTER TABLE users ADD COLUMN primary_wellness_goal text;
  END IF;
END $$;

-- Create MVP activity logs table
CREATE TABLE IF NOT EXISTS mvp_activity_logs (
  id serial PRIMARY KEY,
  user_id integer REFERENCES users(id) NOT NULL,
  raw_text_input text NOT NULL,
  detected_intent text NOT NULL CHECK (detected_intent IN ('workout', 'food_intake', 'supplement_intake', 'meditation', 'general_activity_log')),
  extracted_keywords jsonb DEFAULT '{}',
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE mvp_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for MVP activity logs
CREATE POLICY "Users can read own MVP activity logs"
  ON mvp_activity_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own MVP activity logs"
  ON mvp_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own MVP activity logs"
  ON mvp_activity_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own MVP activity logs"
  ON mvp_activity_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mvp_activity_logs_user_id ON mvp_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mvp_activity_logs_timestamp ON mvp_activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_mvp_activity_logs_intent ON mvp_activity_logs(detected_intent);