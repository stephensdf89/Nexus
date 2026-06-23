-- Creator Nexus Pro - Database Schema Migration
-- Run this SQL in your Supabase SQL Editor to set up all required tables

-- ============================================================================
-- TABLE: integrations
-- Purpose: Store OAuth tokens and platform connection data for each user
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  platform TEXT NOT NULL,
  platform_id TEXT,
  channel_name TEXT,
  thumbnail_url TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE: user_settings
-- Purpose: Store user preferences (theme, language, region, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'neon',
  language TEXT DEFAULT 'en',
  region TEXT DEFAULT 'US',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================================
-- TABLE: scheduled_posts
-- Purpose: Store content scheduled for future publishing
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.scheduled_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  user_email TEXT NOT NULL,
  platforms TEXT[] DEFAULT '{}',
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE: notifications
-- Purpose: Store in-app notifications for each authenticated user
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'system',
  message TEXT NOT NULL,
  category TEXT DEFAULT 'platform',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_email ON public.integrations(user_email);
CREATE INDEX IF NOT EXISTS idx_integrations_platform ON public.integrations(platform);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON public.scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_email ON public.scheduled_posts(user_email);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_time ON public.scheduled_posts(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- This ensures users can only access their own data
-- ============================================================================

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES: integrations table
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own integrations" ON public.integrations;
CREATE POLICY "Users can view their own integrations"
  ON public.integrations FOR SELECT
  USING (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email');

DROP POLICY IF EXISTS "Users can insert their own integrations" ON public.integrations;
CREATE POLICY "Users can insert their own integrations"
  ON public.integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email');

DROP POLICY IF EXISTS "Users can update their own integrations" ON public.integrations;
CREATE POLICY "Users can update their own integrations"
  ON public.integrations FOR UPDATE
  USING (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email');

DROP POLICY IF EXISTS "Users can delete their own integrations" ON public.integrations;
CREATE POLICY "Users can delete their own integrations"
  ON public.integrations FOR DELETE
  USING (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email');

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES: user_settings table
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
CREATE POLICY "Users can view their own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
CREATE POLICY "Users can insert their own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
CREATE POLICY "Users can update their own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES: scheduled_posts table
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own posts" ON public.scheduled_posts;
CREATE POLICY "Users can view their own posts"
  ON public.scheduled_posts FOR SELECT
  USING (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email');

DROP POLICY IF EXISTS "Users can insert their own posts" ON public.scheduled_posts;
CREATE POLICY "Users can insert their own posts"
  ON public.scheduled_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email');

DROP POLICY IF EXISTS "Users can update their own posts" ON public.scheduled_posts;
CREATE POLICY "Users can update their own posts"
  ON public.scheduled_posts FOR UPDATE
  USING (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email');

DROP POLICY IF EXISTS "Users can delete their own posts" ON public.scheduled_posts;
CREATE POLICY "Users can delete their own posts"
  ON public.scheduled_posts FOR DELETE
  USING (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email');

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES: notifications table
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
CREATE POLICY "Users can insert their own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- VERIFY SETUP
-- ============================================================================

-- Check that all tables exist and have correct structure
SELECT 
  table_name,
  (SELECT count(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = tables.table_name) as column_count
FROM information_schema.tables as tables
WHERE table_schema = 'public' 
  AND table_name IN ('integrations', 'user_settings', 'scheduled_posts', 'notifications')
ORDER BY table_name;

-- Expected output:
-- integrations       | 11 columns
-- notifications      | 9 columns
-- scheduled_posts    | 9 columns  
-- user_settings      | 6 columns
