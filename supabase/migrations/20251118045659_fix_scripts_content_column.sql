/*
  # Fix Scripts Content Column

  1. Changes to `scripts` table
    - Make `content` column nullable to allow optional script content
    - This allows scripts to be created with just a prompt for AI generation

  2. Notes
    - The `script_content` column is the new preferred field
    - `content` is kept for backward compatibility but is now optional
*/

-- Make content column nullable
ALTER TABLE scripts ALTER COLUMN content DROP NOT NULL;
