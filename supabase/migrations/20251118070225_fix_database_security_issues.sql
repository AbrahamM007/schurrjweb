/*
  # Fix Database Security and Performance Issues

  1. Performance Improvements
    - Add missing indexes for foreign keys to improve query performance
    - Remove unused indexes that aren't being utilized

  2. RLS Policy Optimization
    - Wrap auth functions in SELECT statements to prevent re-evaluation per row
    - This significantly improves query performance at scale

  3. Function Security
    - Fix function search paths to be immutable for security

  4. Policy Cleanup
    - Remove duplicate/redundant RLS policies
    - Consolidate overlapping policies into single, clear policies
*/

-- =====================================================
-- 1. ADD MISSING INDEXES FOR FOREIGN KEYS
-- =====================================================

-- article_likes indexes
CREATE INDEX IF NOT EXISTS article_likes_user_id_idx ON public.article_likes(user_id);

-- comment_likes indexes
CREATE INDEX IF NOT EXISTS comment_likes_user_id_idx ON public.comment_likes(user_id);

-- comments indexes
CREATE INDEX IF NOT EXISTS comments_author_id_idx ON public.comments(author_id);

-- scripts indexes
CREATE INDEX IF NOT EXISTS scripts_author_id_idx ON public.scripts(author_id);
CREATE INDEX IF NOT EXISTS scripts_created_by_idx ON public.scripts(created_by);
CREATE INDEX IF NOT EXISTS scripts_task_id_idx ON public.scripts(task_id);

-- team_tasks indexes
CREATE INDEX IF NOT EXISTS team_tasks_assigned_to_idx ON public.team_tasks(assigned_to);

-- =====================================================
-- 2. REMOVE UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS public.articles_status_idx;
DROP INDEX IF EXISTS public.articles_section_idx;
DROP INDEX IF EXISTS public.articles_published_at_idx;
DROP INDEX IF EXISTS public.articles_author_id_idx;
DROP INDEX IF EXISTS public.comments_article_id_idx;
DROP INDEX IF EXISTS public.comments_approved_idx;
DROP INDEX IF EXISTS public.idx_chronicles_published;
DROP INDEX IF EXISTS public.idx_chronicles_author;
DROP INDEX IF EXISTS public.idx_content_analytics_content;
DROP INDEX IF EXISTS public.idx_content_analytics_trending;
DROP INDEX IF EXISTS public.idx_ai_insights_type;

-- =====================================================
-- 3. FIX FUNCTION SEARCH PATHS
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_chronicles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_article_views(article_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE articles
  SET view_count = view_count + 1
  WHERE id = article_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.toggle_article_like(article_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid := auth.uid();
  like_exists boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM article_likes
    WHERE article_likes.article_id = toggle_article_like.article_id
    AND article_likes.user_id = toggle_article_like.user_id
  ) INTO like_exists;

  IF like_exists THEN
    DELETE FROM article_likes
    WHERE article_likes.article_id = toggle_article_like.article_id
    AND article_likes.user_id = toggle_article_like.user_id;
    
    UPDATE articles
    SET like_count = like_count - 1
    WHERE id = toggle_article_like.article_id;
  ELSE
    INSERT INTO article_likes (article_id, user_id)
    VALUES (toggle_article_like.article_id, toggle_article_like.user_id);
    
    UPDATE articles
    SET like_count = like_count + 1
    WHERE id = toggle_article_like.article_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.toggle_comment_like(comment_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid := auth.uid();
  like_exists boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM comment_likes
    WHERE comment_likes.comment_id = toggle_comment_like.comment_id
    AND comment_likes.user_id = toggle_comment_like.user_id
  ) INTO like_exists;

  IF like_exists THEN
    DELETE FROM comment_likes
    WHERE comment_likes.comment_id = toggle_comment_like.comment_id
    AND comment_likes.user_id = toggle_comment_like.user_id;
    
    UPDATE comments
    SET like_count = like_count - 1
    WHERE id = toggle_comment_like.comment_id;
  ELSE
    INSERT INTO comment_likes (comment_id, user_id)
    VALUES (toggle_comment_like.comment_id, toggle_comment_like.user_id);
    
    UPDATE comments
    SET like_count = like_count + 1
    WHERE id = toggle_comment_like.comment_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$;

-- =====================================================
-- 4. OPTIMIZE RLS POLICIES WITH SELECT WRAPPING
-- =====================================================

-- Drop all existing policies and recreate with optimized versions

-- profiles policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- scripts policies
DROP POLICY IF EXISTS "Admin can create scripts" ON public.scripts;
DROP POLICY IF EXISTS "Admin can read scripts" ON public.scripts;
DROP POLICY IF EXISTS "Admin can update scripts" ON public.scripts;
DROP POLICY IF EXISTS "Admin can delete scripts" ON public.scripts;

CREATE POLICY "Admin can manage scripts"
  ON public.scripts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- articles policies
DROP POLICY IF EXISTS "Admins and editors can update any article" ON public.articles;
DROP POLICY IF EXISTS "Authenticated users can create articles" ON public.articles;
DROP POLICY IF EXISTS "Users can delete own articles" ON public.articles;
DROP POLICY IF EXISTS "Users can update own articles" ON public.articles;
DROP POLICY IF EXISTS "Anyone can read published articles" ON public.articles;
DROP POLICY IF EXISTS "Authenticated users can read all articles" ON public.articles;

CREATE POLICY "Anyone can read published articles"
  ON public.articles FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Authenticated users can create articles"
  ON public.articles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = author_id);

CREATE POLICY "Users can manage own articles"
  ON public.articles FOR ALL
  TO authenticated
  USING ((select auth.uid()) = author_id)
  WITH CHECK ((select auth.uid()) = author_id);

CREATE POLICY "Admins can manage all articles"
  ON public.articles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- comments policies
DROP POLICY IF EXISTS "Admins can delete any comment" ON public.comments;
DROP POLICY IF EXISTS "Admins can update any comment" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can read approved comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can read all comments" ON public.comments;

CREATE POLICY "Anyone can read approved comments"
  ON public.comments FOR SELECT
  TO anon, authenticated
  USING (approved = true);

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = author_id);

CREATE POLICY "Users can manage own comments"
  ON public.comments FOR ALL
  TO authenticated
  USING ((select auth.uid()) = author_id)
  WITH CHECK ((select auth.uid()) = author_id);

CREATE POLICY "Admins can manage all comments"
  ON public.comments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- article_likes policies
DROP POLICY IF EXISTS "Anyone can read article likes" ON public.article_likes;
DROP POLICY IF EXISTS "Users can manage own article likes" ON public.article_likes;

CREATE POLICY "Anyone can read article likes"
  ON public.article_likes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage own article likes"
  ON public.article_likes FOR ALL
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- comment_likes policies
DROP POLICY IF EXISTS "Anyone can read comment likes" ON public.comment_likes;
DROP POLICY IF EXISTS "Users can manage own comment likes" ON public.comment_likes;

CREATE POLICY "Anyone can read comment likes"
  ON public.comment_likes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage own comment likes"
  ON public.comment_likes FOR ALL
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- submissions policies
DROP POLICY IF EXISTS "Admin can manage submissions" ON public.submissions;
DROP POLICY IF EXISTS "Anyone can submit stories" ON public.submissions;
DROP POLICY IF EXISTS "Authenticated users can create submissions" ON public.submissions;
DROP POLICY IF EXISTS "Authenticated users can read all submissions" ON public.submissions;
DROP POLICY IF EXISTS "Authenticated users can read submissions" ON public.submissions;
DROP POLICY IF EXISTS "Authenticated users can delete submissions" ON public.submissions;
DROP POLICY IF EXISTS "Authenticated users can update submissions" ON public.submissions;

CREATE POLICY "Anyone can create submissions"
  ON public.submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can manage all submissions"
  ON public.submissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- gallery_items policies
DROP POLICY IF EXISTS "Admin can manage gallery" ON public.gallery_items;
DROP POLICY IF EXISTS "Anyone can read gallery items" ON public.gallery_items;
DROP POLICY IF EXISTS "Anyone can view gallery" ON public.gallery_items;
DROP POLICY IF EXISTS "Authenticated users can delete gallery" ON public.gallery_items;
DROP POLICY IF EXISTS "Authenticated users can insert gallery" ON public.gallery_items;

CREATE POLICY "Anyone can view gallery"
  ON public.gallery_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can manage gallery"
  ON public.gallery_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- opinions policies
DROP POLICY IF EXISTS "Admin can manage opinions" ON public.opinions;
DROP POLICY IF EXISTS "Anyone can read opinions" ON public.opinions;
DROP POLICY IF EXISTS "Anyone can view opinions" ON public.opinions;
DROP POLICY IF EXISTS "Authenticated users can delete opinions" ON public.opinions;
DROP POLICY IF EXISTS "Authenticated users can insert opinions" ON public.opinions;

CREATE POLICY "Anyone can view opinions"
  ON public.opinions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can manage opinions"
  ON public.opinions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- weekly_videos policies
DROP POLICY IF EXISTS "Admin can manage weekly videos" ON public.weekly_videos;
DROP POLICY IF EXISTS "Anyone can read weekly videos" ON public.weekly_videos;
DROP POLICY IF EXISTS "Anyone can view weekly videos" ON public.weekly_videos;
DROP POLICY IF EXISTS "Authenticated users can delete weekly videos" ON public.weekly_videos;
DROP POLICY IF EXISTS "Authenticated users can insert weekly videos" ON public.weekly_videos;

CREATE POLICY "Anyone can view weekly videos"
  ON public.weekly_videos FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can manage weekly videos"
  ON public.weekly_videos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- team_tasks policies
DROP POLICY IF EXISTS "Admin can manage tasks" ON public.team_tasks;

CREATE POLICY "Admin can manage tasks"
  ON public.team_tasks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- config policies
DROP POLICY IF EXISTS "Admin can manage config" ON public.config;
DROP POLICY IF EXISTS "Anyone can read config" ON public.config;

CREATE POLICY "Anyone can read config"
  ON public.config FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can manage config"
  ON public.config FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- chronicles policies
DROP POLICY IF EXISTS "Only author or admin can delete chronicles" ON public.chronicles;
DROP POLICY IF EXISTS "Only author or admin can insert chronicles" ON public.chronicles;
DROP POLICY IF EXISTS "Only author or admin can update chronicles" ON public.chronicles;
DROP POLICY IF EXISTS "Anyone can view published chronicles" ON public.chronicles;
DROP POLICY IF EXISTS "Authenticated users can view all chronicles" ON public.chronicles;

CREATE POLICY "Anyone can view published chronicles"
  ON public.chronicles FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "Admin can manage chronicles"
  ON public.chronicles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );
