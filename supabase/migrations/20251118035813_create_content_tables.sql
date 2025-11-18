/*
  # Create Content Management Tables

  1. New Tables
    - `submissions`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `title` (text, nullable)
      - `body` (text)
      - `category` (text) - opinion, news, sports, gallery
      - `suggested_headline` (text, nullable)
      - `image_url` (text, nullable)
      - `status` (text) - pending, approved
      - `created_at` (timestamptz)

    - `gallery_items`
      - `id` (uuid, primary key)
      - `title` (text)
      - `credit` (text)
      - `image_url` (text)
      - `created_at` (timestamptz)

    - `opinions`
      - `id` (uuid, primary key)
      - `text` (text)
      - `author` (text)
      - `created_at` (timestamptz)

    - `weekly_videos`
      - `id` (uuid, primary key)
      - `youtube_id` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public can read published content
    - Only authenticated users can insert/update/delete
*/

CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  title text,
  body text NOT NULL,
  category text NOT NULL CHECK (category IN ('opinion', 'news', 'sports', 'gallery')),
  suggested_headline text,
  image_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  credit text,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS opinions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  author text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS weekly_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE opinions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit stories"
  ON submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read submissions"
  ON submissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update submissions"
  ON submissions
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete submissions"
  ON submissions
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view gallery"
  ON gallery_items
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert gallery"
  ON gallery_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete gallery"
  ON gallery_items
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view opinions"
  ON opinions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert opinions"
  ON opinions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete opinions"
  ON opinions
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view weekly videos"
  ON weekly_videos
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert weekly videos"
  ON weekly_videos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete weekly videos"
  ON weekly_videos
  FOR DELETE
  TO authenticated
  USING (true);