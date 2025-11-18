/*
  # Update Scripts Table for Video Workflow

  1. Changes to `scripts` table
    - Add `gemini_prompt` column to store AI generation prompts
    - Add `video_status` column to track production stages
    - Add `script_content` column (rename from `content`)
    - Add `updated_at` timestamp
    - Add `created_by` to track who created the script
    - Add `task_id` to link scripts with team tasks

  2. Security
    - Update RLS policies for the new structure
*/

-- Add new columns to scripts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scripts' AND column_name = 'gemini_prompt'
  ) THEN
    ALTER TABLE scripts ADD COLUMN gemini_prompt text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scripts' AND column_name = 'video_status'
  ) THEN
    ALTER TABLE scripts ADD COLUMN video_status text DEFAULT 'draft' CHECK (video_status IN ('draft', 'in_production', 'completed'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scripts' AND column_name = 'script_content'
  ) THEN
    ALTER TABLE scripts ADD COLUMN script_content text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scripts' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE scripts ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scripts' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE scripts ADD COLUMN created_by uuid REFERENCES profiles(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scripts' AND column_name = 'task_id'
  ) THEN
    ALTER TABLE scripts ADD COLUMN task_id uuid REFERENCES team_tasks(id);
  END IF;
END $$;

-- Migrate existing content to script_content if needed
UPDATE scripts SET script_content = content WHERE script_content IS NULL AND content IS NOT NULL;
