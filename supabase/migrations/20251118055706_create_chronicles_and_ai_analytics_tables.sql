/*
  # Create Chronicles and AI Analytics System

  1. New Tables
    - `chronicles`
      - `id` (uuid, primary key)
      - `title` (text) - Chronicle title
      - `content` (text) - Full chronicle content
      - `author_id` (uuid, foreign key to profiles)
      - `cover_image_url` (text) - Optional cover image
      - `published` (boolean) - Whether chronicle is published
      - `ai_summary` (text) - AI-generated summary
      - `ai_generated_tags` (text array) - AI-generated content tags
      - `engagement_score` (integer) - AI predicted engagement
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `content_analytics`
      - `id` (uuid, primary key)
      - `content_id` (uuid) - Reference to any content
      - `content_type` (text) - Type: submission, chronicle, script
      - `ai_category` (text) - AI-determined category
      - `ai_topics` (text array) - AI-identified topics
      - `readability_score` (integer) - Content readability
      - `duplicate_score` (integer) - Similarity to other content
      - `trending_score` (integer) - Trending topic relevance
      - `optimal_publish_time` (timestamptz) - AI-suggested publish time
      - `predicted_engagement` (integer) - AI engagement prediction
      - `created_at` (timestamptz)

    - `ai_insights`
      - `id` (uuid, primary key)
      - `insight_type` (text) - Type of insight
      - `insight_data` (jsonb) - Insight details
      - `related_content_ids` (uuid array) - Related content
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Public can read published chronicles
    - Only authenticated users can read analytics
    - Only admins can create/edit chronicles and view insights

  3. Indexes
    - Add indexes for performance on common queries
*/

-- Create chronicles table
CREATE TABLE IF NOT EXISTS chronicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  cover_image_url text DEFAULT '',
  published boolean DEFAULT false,
  ai_summary text DEFAULT '',
  ai_generated_tags text[] DEFAULT '{}',
  engagement_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create content_analytics table
CREATE TABLE IF NOT EXISTS content_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL,
  content_type text NOT NULL,
  ai_category text DEFAULT '',
  ai_topics text[] DEFAULT '{}',
  readability_score integer DEFAULT 0,
  duplicate_score integer DEFAULT 0,
  trending_score integer DEFAULT 0,
  optimal_publish_time timestamptz,
  predicted_engagement integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create ai_insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type text NOT NULL,
  insight_data jsonb DEFAULT '{}'::jsonb,
  related_content_ids uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chronicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- Chronicles policies
CREATE POLICY "Anyone can view published chronicles"
  ON chronicles FOR SELECT
  USING (published = true);

CREATE POLICY "Authenticated users can view all chronicles"
  ON chronicles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only author or admin can insert chronicles"
  ON chronicles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only author or admin can update chronicles"
  ON chronicles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only author or admin can delete chronicles"
  ON chronicles FOR DELETE
  TO authenticated
  USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Content analytics policies
CREATE POLICY "Authenticated users can view analytics"
  ON content_analytics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert analytics"
  ON content_analytics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update analytics"
  ON content_analytics FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- AI insights policies
CREATE POLICY "Authenticated users can view insights"
  ON ai_insights FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert insights"
  ON ai_insights FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chronicles_published ON chronicles(published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chronicles_author ON chronicles(author_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_content ON content_analytics(content_id, content_type);
CREATE INDEX IF NOT EXISTS idx_content_analytics_trending ON content_analytics(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(insight_type, created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chronicles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chronicles_timestamp
  BEFORE UPDATE ON chronicles
  FOR EACH ROW
  EXECUTE FUNCTION update_chronicles_updated_at();
