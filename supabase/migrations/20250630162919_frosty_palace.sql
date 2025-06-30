/*
  # Create Evolve AI MVP Database Schema

  1. New Tables
    - `users`
      - `id` (text, primary key) - matches Supabase auth.users.id
      - `email` (text, unique)
      - `name` (text)
      - `age` (integer, optional)
      - `primary_wellness_goal` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `mvp_activity_logs`
      - `id` (serial, primary key)
      - `user_id` (text, references users.id)
      - `raw_text_input` (text)
      - `detected_intent` (text with constraints)
      - `extracted_keywords` (jsonb)
      - `timestamp` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data

  3. Performance
    - Add indexes for common queries
*/

-- Create users table first
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY, -- This will match auth.users.id
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  age integer,
  primary_wellness_goal text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id);

CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id);

-- Create MVP activity logs table
CREATE TABLE IF NOT EXISTS mvp_activity_logs (
  id serial PRIMARY KEY,
  user_id text REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  raw_text_input text NOT NULL,
  detected_intent text NOT NULL CHECK (detected_intent IN ('workout', 'food_intake', 'supplement_intake', 'meditation', 'general_activity_log')),
  extracted_keywords jsonb DEFAULT '{}',
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on MVP activity logs
ALTER TABLE mvp_activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for MVP activity logs
CREATE POLICY "Users can read own MVP activity logs"
  ON mvp_activity_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own MVP activity logs"
  ON mvp_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own MVP activity logs"
  ON mvp_activity_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own MVP activity logs"
  ON mvp_activity_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_mvp_activity_logs_user_id ON mvp_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mvp_activity_logs_timestamp ON mvp_activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_mvp_activity_logs_intent ON mvp_activity_logs(detected_intent);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();