-- Creator Nexus Pro - Database Schema Migration
-- Run this SQL in your Supabase SQL Editor to set up all required tables

-- Ensure UUID generator function exists for uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Backfill missing columns for legacy integrations table variants
ALTER TABLE IF EXISTS public.integrations ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS public.integrations ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE IF EXISTS public.integrations ADD COLUMN IF NOT EXISTS platform TEXT;
ALTER TABLE IF EXISTS public.integrations ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE IF EXISTS public.integrations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

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
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Ensure settings JSON exists for code paths that upsert/read user_settings.settings
ALTER TABLE IF EXISTS public.user_settings ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}'::jsonb;

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

-- Backfill missing columns for legacy scheduled_posts table variants
ALTER TABLE IF EXISTS public.scheduled_posts ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS public.scheduled_posts ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE IF EXISTS public.scheduled_posts ADD COLUMN IF NOT EXISTS scheduled_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE IF EXISTS public.scheduled_posts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE IF EXISTS public.scheduled_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

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
-- TABLE: ai_threads
-- Purpose: Store assistant conversation threads per user
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New assistant chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE: ai_messages
-- Purpose: Store messages for each assistant thread
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES public.ai_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  model TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (role IN ('user', 'assistant', 'system'))
);

-- ============================================================================
-- TABLE: user_access
-- Purpose: Store owner-managed access levels for paid/unlocked features
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_level TEXT NOT NULL DEFAULT 'user',
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id),
  CHECK (access_level IN ('user', 'pro', 'admin'))
);

-- ============================================================================
-- TABLE: access_audit_logs
-- Purpose: Track role changes and denied premium-access attempts
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.access_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  event_type TEXT NOT NULL,
  resource TEXT,
  required_level TEXT,
  current_level TEXT,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (event_type IN ('access_denied', 'access_granted', 'role_change', 'owner_check_failed'))
);

-- Backfill missing columns for legacy assistant table variants
ALTER TABLE IF EXISTS public.ai_threads ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS public.ai_threads ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'New assistant chat';
ALTER TABLE IF EXISTS public.ai_threads ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE IF EXISTS public.ai_threads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE IF EXISTS public.ai_messages ADD COLUMN IF NOT EXISTS thread_id UUID;
ALTER TABLE IF EXISTS public.ai_messages ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS public.ai_messages ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE IF EXISTS public.ai_messages ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE IF EXISTS public.ai_messages ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE IF EXISTS public.ai_messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Backfill missing columns for legacy user_access table variants
ALTER TABLE IF EXISTS public.user_access ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS public.user_access ADD COLUMN IF NOT EXISTS access_level TEXT DEFAULT 'user';
ALTER TABLE IF EXISTS public.user_access ADD COLUMN IF NOT EXISTS granted_by UUID;
ALTER TABLE IF EXISTS public.user_access ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE IF EXISTS public.user_access ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Backfill missing columns for legacy access_audit_logs table variants
ALTER TABLE IF EXISTS public.access_audit_logs ADD COLUMN IF NOT EXISTS actor_user_id UUID;
ALTER TABLE IF EXISTS public.access_audit_logs ADD COLUMN IF NOT EXISTS actor_email TEXT;
ALTER TABLE IF EXISTS public.access_audit_logs ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE IF EXISTS public.access_audit_logs ADD COLUMN IF NOT EXISTS resource TEXT;
ALTER TABLE IF EXISTS public.access_audit_logs ADD COLUMN IF NOT EXISTS required_level TEXT;
ALTER TABLE IF EXISTS public.access_audit_logs ADD COLUMN IF NOT EXISTS current_level TEXT;
ALTER TABLE IF EXISTS public.access_audit_logs ADD COLUMN IF NOT EXISTS success BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE IF EXISTS public.access_audit_logs ADD COLUMN IF NOT EXISTS target_user_id UUID;
ALTER TABLE IF EXISTS public.access_audit_logs ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE IF EXISTS public.access_audit_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Backfill missing columns for legacy notifications table variants
ALTER TABLE IF EXISTS public.notifications ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS public.notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'system';
ALTER TABLE IF EXISTS public.notifications ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE IF EXISTS public.notifications ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'platform';
ALTER TABLE IF EXISTS public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE IF EXISTS public.notifications ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE IF EXISTS public.notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE IF EXISTS public.notifications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

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
CREATE INDEX IF NOT EXISTS idx_ai_threads_user_id ON public.ai_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_threads_updated_at ON public.ai_threads(updated_at);
CREATE INDEX IF NOT EXISTS idx_ai_messages_thread_id ON public.ai_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_user_id ON public.ai_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON public.ai_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_user_access_user_id ON public.user_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_access_level ON public.user_access(access_level);
CREATE INDEX IF NOT EXISTS idx_access_audit_logs_actor_user_id ON public.access_audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_access_audit_logs_event_type ON public.access_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_access_audit_logs_created_at ON public.access_audit_logs(created_at);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- This ensures users can only access their own data
-- ============================================================================

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_audit_logs ENABLE ROW LEVEL SECURITY;

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
  USING (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email')
  WITH CHECK (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email');

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
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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
  USING (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email')
  WITH CHECK (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email');

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
-- ROW LEVEL SECURITY POLICIES: ai_threads table
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own ai threads" ON public.ai_threads;
CREATE POLICY "Users can view their own ai threads"
  ON public.ai_threads FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own ai threads" ON public.ai_threads;
CREATE POLICY "Users can insert their own ai threads"
  ON public.ai_threads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own ai threads" ON public.ai_threads;
CREATE POLICY "Users can update their own ai threads"
  ON public.ai_threads FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own ai threads" ON public.ai_threads;
CREATE POLICY "Users can delete their own ai threads"
  ON public.ai_threads FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES: ai_messages table
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own ai messages" ON public.ai_messages;
CREATE POLICY "Users can view their own ai messages"
  ON public.ai_messages FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own ai messages" ON public.ai_messages;
CREATE POLICY "Users can insert their own ai messages"
  ON public.ai_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.ai_threads t
      WHERE t.id = ai_messages.thread_id
        AND t.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own ai messages" ON public.ai_messages;
CREATE POLICY "Users can update their own ai messages"
  ON public.ai_messages FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own ai messages" ON public.ai_messages;
CREATE POLICY "Users can delete their own ai messages"
  ON public.ai_messages FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES: user_access table
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own access" ON public.user_access;
CREATE POLICY "Users can view their own access"
  ON public.user_access FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users cannot self-insert access" ON public.user_access;
CREATE POLICY "Users cannot self-insert access"
  ON public.user_access FOR INSERT
  WITH CHECK (FALSE);

DROP POLICY IF EXISTS "Users cannot self-update access" ON public.user_access;
CREATE POLICY "Users cannot self-update access"
  ON public.user_access FOR UPDATE
  USING (FALSE)
  WITH CHECK (FALSE);

DROP POLICY IF EXISTS "Users cannot self-delete access" ON public.user_access;
CREATE POLICY "Users cannot self-delete access"
  ON public.user_access FOR DELETE
  USING (FALSE);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES: access_audit_logs table
-- ============================================================================

DROP POLICY IF EXISTS "Users cannot view access audit logs" ON public.access_audit_logs;
CREATE POLICY "Users cannot view access audit logs"
  ON public.access_audit_logs FOR SELECT
  USING (FALSE);

DROP POLICY IF EXISTS "Users cannot insert access audit logs" ON public.access_audit_logs;
CREATE POLICY "Users cannot insert access audit logs"
  ON public.access_audit_logs FOR INSERT
  WITH CHECK (FALSE);

DROP POLICY IF EXISTS "Users cannot update access audit logs" ON public.access_audit_logs;
CREATE POLICY "Users cannot update access audit logs"
  ON public.access_audit_logs FOR UPDATE
  USING (FALSE)
  WITH CHECK (FALSE);

DROP POLICY IF EXISTS "Users cannot delete access audit logs" ON public.access_audit_logs;
CREATE POLICY "Users cannot delete access audit logs"
  ON public.access_audit_logs FOR DELETE
  USING (FALSE);

-- ============================================================================
-- VERIFY SETUP
-- ============================================================================

-- Check that all tables exist and have correct structure
SELECT 
  table_name,
  (SELECT count(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = tables.table_name) as column_count
FROM information_schema.tables as tables
WHERE table_schema = 'public' 
  AND table_name IN ('integrations', 'user_settings', 'scheduled_posts', 'notifications', 'ai_threads', 'ai_messages', 'user_access', 'access_audit_logs')
ORDER BY table_name;

-- Expected output:
-- integrations       | 11 columns
-- ai_threads         | 5 columns
-- ai_messages        | 7 columns
-- notifications      | 9 columns
-- scheduled_posts    | 9 columns  
-- user_settings      | 6 columns
-- user_access        | 7 columns
-- access_audit_logs  | 11 columns
