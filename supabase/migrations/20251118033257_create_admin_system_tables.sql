/*
  # Admin System with Script Management and Team Tasks

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `is_admin` (boolean, default false)
      - `display_name` (text)
      - `created_at` (timestamptz)
    
    - `video_scripts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `script_content` (text)
      - `gemini_prompt` (text)
      - `video_status` (text: draft, generating, completed, failed)
      - `video_url` (text, nullable)
      - `created_by` (uuid, references users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `team_tasks`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `assigned_to` (uuid, references users, nullable)
      - `status` (text: pending, in_progress, completed)
      - `priority` (text: low, medium, high)
      - `due_date` (timestamptz, nullable)
      - `created_by` (uuid, references users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Admins can do everything
    - Non-admins can view their assigned tasks
    - Non-admins can update their own task status
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  is_admin boolean DEFAULT false,
  display_name text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users AS u
      WHERE u.id = auth.uid() AND u.is_admin = true
    )
  );

CREATE POLICY "Users can view themselves"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users AS u
      WHERE u.id = auth.uid() AND u.is_admin = true
    )
  );

CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users AS u
      WHERE u.id = auth.uid() AND u.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users AS u
      WHERE u.id = auth.uid() AND u.is_admin = true
    )
  );

CREATE TABLE IF NOT EXISTS video_scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  script_content text DEFAULT '',
  gemini_prompt text DEFAULT '',
  video_status text DEFAULT 'draft',
  video_url text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE video_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all scripts"
  ON video_scripts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can insert scripts"
  ON video_scripts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update scripts"
  ON video_scripts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can delete scripts"
  ON video_scripts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE TABLE IF NOT EXISTS team_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  assigned_to uuid REFERENCES users(id),
  status text DEFAULT 'pending',
  priority text DEFAULT 'medium',
  due_date timestamptz,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE team_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all tasks"
  ON team_tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Users can view assigned tasks"
  ON team_tasks FOR SELECT
  TO authenticated
  USING (assigned_to = auth.uid());

CREATE POLICY "Admins can insert tasks"
  ON team_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update tasks"
  ON team_tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Users can update assigned task status"
  ON team_tasks FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

CREATE POLICY "Admins can delete tasks"
  ON team_tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );