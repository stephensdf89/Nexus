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
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  platform TEXT,
  user_email TEXT,
  platform_id TEXT,
  channel_name TEXT,
  thumbnail_url TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backfill missing columns for legacy integrations table variants
ALTER TABLE IF EXISTS public.integrations ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS public.integrations ADD COLUMN IF NOT EXISTS provider TEXT;
ALTER TABLE IF EXISTS public.integrations ADD COLUMN IF NOT EXISTS access_token TEXT;
ALTER TABLE IF EXISTS public.integrations ADD COLUMN IF NOT EXISTS refresh_token TEXT;
ALTER TABLE IF EXISTS public.integrations ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE IF EXISTS public.integrations ADD COLUMN IF NOT EXISTS scope TEXT;
ALTER TABLE IF EXISTS public.integrations ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE IF EXISTS public.integrations ADD COLUMN IF NOT EXISTS platform TEXT;
ALTER TABLE IF EXISTS public.integrations ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE IF EXISTS public.integrations ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE IF EXISTS public.integrations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================================================
-- TABLE: integration_triggers
-- Purpose: Store external integration events that can start pipelines
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.integration_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  type TEXT NOT NULL,
  pipeline_id UUID REFERENCES public.pipelines(id) ON DELETE CASCADE,
  config JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS integration_triggers_user_idx ON public.integration_triggers(user_id);
CREATE INDEX IF NOT EXISTS integration_triggers_pipeline_idx ON public.integration_triggers(pipeline_id);

-- ============================================================================
-- TABLE: pipeline_templates
-- Purpose: Store reusable pipeline definitions and presets
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.pipeline_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  icon TEXT,
  steps JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.pipeline_templates (name, description, category, icon, steps)
SELECT 'YouTube Upload Pipeline', 'Upload a video, wait briefly, then notify a webhook.', 'publishing', '▶️', '[
  {"type": "integration", "config": {"provider": "youtube", "action": "upload"}},
  {"type": "delay", "config": {"ms": 2000}},
  {"type": "http", "config": {"url": "https://example.com/notify"}}
]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pipeline_templates WHERE name = 'YouTube Upload Pipeline');

INSERT INTO public.pipeline_templates (name, description, category, icon, steps)
SELECT 'TikTok + Instagram Cross-Post', 'Publish the same content to TikTok, Instagram, and X.', 'publishing', '🔁', '[
  {"type": "integration", "config": {"provider": "tiktok", "action": "upload"}},
  {"type": "integration", "config": {"provider": "instagram", "action": "upload"}},
  {"type": "integration", "config": {"provider": "x", "action": "post"}}
]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pipeline_templates WHERE name = 'TikTok + Instagram Cross-Post');

INSERT INTO public.pipeline_templates (name, description, category, icon, steps)
SELECT 'Auto-Reply to Instagram DMs', 'Trigger on a new Instagram DM, generate a reply, and send it back.', 'automation', '💬', '[
  {"type": "trigger", "config": {"provider": "instagram", "event": "new_dm"}},
  {"type": "transform", "config": {"action": "generate_reply"}},
  {"type": "integration", "config": {"provider": "instagram", "action": "send_dm"}}
]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pipeline_templates WHERE name = 'Auto-Reply to Instagram DMs');

INSERT INTO public.pipeline_templates (name, description, category, icon, steps)
SELECT 'Daily Content Summary', 'Fetch analytics, summarize them, and email the result.', 'analytics', '📊', '[
  {"type": "http", "config": {"action": "fetch_analytics"}},
  {"type": "transform", "config": {"action": "summarize"}},
  {"type": "integration", "config": {"provider": "gmail", "action": "send_email"}}
]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pipeline_templates WHERE name = 'Daily Content Summary');

INSERT INTO public.pipeline_templates (name, description, category, icon, steps)
SELECT 'Drive -> YouTube', 'Watch for new Drive files and upload them to YouTube.', 'publishing', '📁', '[
  {"type": "trigger", "config": {"provider": "google_drive", "event": "new_file"}},
  {"type": "integration", "config": {"provider": "youtube", "action": "upload"}}
]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pipeline_templates WHERE name = 'Drive -> YouTube');

INSERT INTO public.pipeline_templates (name, description, category, icon, steps)
SELECT 'Multi-Platform Blast', 'Send one piece of content to every major platform.', 'publishing', '🚀', '[
  {"type": "integration", "config": {"provider": "youtube", "action": "upload"}},
  {"type": "integration", "config": {"provider": "tiktok", "action": "upload"}},
  {"type": "integration", "config": {"provider": "instagram", "action": "post"}},
  {"type": "integration", "config": {"provider": "x", "action": "post"}}
]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pipeline_templates WHERE name = 'Multi-Platform Blast');

INSERT INTO public.pipeline_templates (name, description, category, icon, steps)
SELECT 'Email -> TikTok Script Generator', 'Turn a new email into a TikTok script and save it to Drive.', 'content', '✉️', '[
  {"type": "trigger", "config": {"provider": "email", "event": "new_email"}},
  {"type": "transform", "config": {"action": "generate_script"}},
  {"type": "integration", "config": {"provider": "google_drive", "action": "save_file"}}
]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pipeline_templates WHERE name = 'Email -> TikTok Script Generator');

INSERT INTO public.pipeline_templates (name, description, category, icon, steps)
SELECT 'TikTok Comment Auto-Responder', 'Reply automatically when a new comment appears on TikTok.', 'automation', '💡', '[
  {"type": "trigger", "config": {"provider": "tiktok", "event": "new_comment"}},
  {"type": "transform", "config": {"action": "generate_reply"}},
  {"type": "integration", "config": {"provider": "tiktok", "action": "post_reply"}}
]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pipeline_templates WHERE name = 'TikTok Comment Auto-Responder');

INSERT INTO public.pipeline_templates (name, description, category, icon, steps)
SELECT 'Scheduled Daily Post', 'Wait until 9am and publish to X.', 'scheduling', '⏰', '[
  {"type": "delay", "config": {"until": "09:00"}},
  {"type": "integration", "config": {"provider": "x", "action": "post"}}
]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pipeline_templates WHERE name = 'Scheduled Daily Post');

INSERT INTO public.pipeline_templates (name, description, category, icon, steps)
SELECT 'Webhook -> Multi-Platform Publish', 'Start from a webhook and publish everywhere immediately.', 'webhooks', '🌐', '[
  {"type": "trigger", "config": {"provider": "webhook", "event": "incoming"}},
  {"type": "integration", "config": {"provider": "youtube", "action": "publish"}},
  {"type": "integration", "config": {"provider": "tiktok", "action": "publish"}},
  {"type": "integration", "config": {"provider": "instagram", "action": "publish"}},
  {"type": "integration", "config": {"provider": "x", "action": "publish"}}
]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.pipeline_templates WHERE name = 'Webhook -> Multi-Platform Publish');

-- ============================================================================
-- TABLE: job_queue
-- Purpose: Track queued pipeline jobs and retry attempts
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.job_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES public.pipeline_runs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, processing, done, failed
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Atomically claim the next pending job to avoid duplicate processing across workers
CREATE OR REPLACE FUNCTION public.claim_next_job()
RETURNS SETOF public.job_queue
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH next_job AS (
    SELECT id
    FROM public.job_queue
    WHERE status = 'pending'
    ORDER BY created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  UPDATE public.job_queue jq
  SET status = 'processing',
      updated_at = NOW()
  FROM next_job
  WHERE jq.id = next_job.id
  RETURNING jq.*;
END;
$$;

-- ============================================================================
-- TABLE: worker_heartbeat
-- Purpose: Track worker liveness by latest heartbeat timestamp
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.worker_heartbeat (
  worker_id TEXT PRIMARY KEY,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE: subscriptions
-- Purpose: Store Stripe subscription state mapped to app users
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE: usage_logs
-- Purpose: Track daily run usage per user
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.usage_logs (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  runs_count INT DEFAULT 0,
  PRIMARY KEY (user_id, date)
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
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Ensure settings JSON exists for code paths that upsert/read user_settings.settings
ALTER TABLE IF EXISTS public.user_settings ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}'::jsonb;

-- ============================================================================
-- TABLE: profiles
-- Purpose: Store public profile details per authenticated user
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  username TEXT UNIQUE,
  bio TEXT,
  twitter TEXT,
  instagram TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backfill missing columns for legacy profiles table variants
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS twitter TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_unique ON public.profiles(username) WHERE username IS NOT NULL;

CREATE OR REPLACE FUNCTION public.set_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_profiles_updated_at();

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
-- TABLE: planner_events
-- Purpose: Store planner events for each authenticated user
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.planner_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
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
  CHECK (event_type IN ('access_denied', 'access_granted', 'role_change', 'owner_check_failed', 'app_settings_change'))
);

CREATE TABLE IF NOT EXISTS public.app_settings (
  id INT PRIMARY KEY DEFAULT 1,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.app_settings (id, settings, updated_at)
VALUES (
  1,
  '{"maintenanceMode":false,"allowSignups":true,"allowPaidModels":true,"defaultAccessLevel":"user","bannerMessage":""}'::jsonb,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE IF EXISTS public.access_audit_logs DROP CONSTRAINT IF EXISTS access_audit_logs_event_type_check;
ALTER TABLE IF EXISTS public.access_audit_logs
  ADD CONSTRAINT access_audit_logs_event_type_check
  CHECK (event_type IN ('access_denied', 'access_granted', 'role_change', 'owner_check_failed', 'app_settings_change'));

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

-- Backfill missing columns for legacy planner_events table variants
ALTER TABLE IF EXISTS public.planner_events ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE IF EXISTS public.planner_events ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE IF EXISTS public.planner_events ADD COLUMN IF NOT EXISTS date TIMESTAMP WITH TIME ZONE;
ALTER TABLE IF EXISTS public.planner_events ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE IF EXISTS public.planner_events ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE IF EXISTS public.planner_events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX IF NOT EXISTS integrations_user_idx ON public.integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_email ON public.integrations(user_email);
CREATE INDEX IF NOT EXISTS job_queue_status_idx ON public.job_queue(status);
CREATE INDEX IF NOT EXISTS idx_integrations_platform ON public.integrations(platform);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON public.scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_email ON public.scheduled_posts(user_email);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_time ON public.scheduled_posts(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_planner_events_user_id ON public.planner_events(user_id);
CREATE INDEX IF NOT EXISTS idx_planner_events_date ON public.planner_events(date);
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
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_events ENABLE ROW LEVEL SECURITY;
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
-- ROW LEVEL SECURITY POLICIES: profiles table
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = id);

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
-- ROW LEVEL SECURITY POLICIES: planner_events table
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own planner events" ON public.planner_events;
CREATE POLICY "Users can view their own planner events"
  ON public.planner_events FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own planner events" ON public.planner_events;
CREATE POLICY "Users can insert their own planner events"
  ON public.planner_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own planner events" ON public.planner_events;
CREATE POLICY "Users can update their own planner events"
  ON public.planner_events FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own planner events" ON public.planner_events;
CREATE POLICY "Users can delete their own planner events"
  ON public.planner_events FOR DELETE
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
  AND table_name IN ('integrations', 'user_settings', 'profiles', 'scheduled_posts', 'notifications', 'planner_events', 'ai_threads', 'ai_messages', 'user_access', 'access_audit_logs')
ORDER BY table_name;

-- Expected output:
-- integrations       | 11 columns
-- ai_threads         | 5 columns
-- ai_messages        | 7 columns
-- notifications      | 9 columns
-- planner_events     | 7 columns
-- profiles           | 8 columns
-- scheduled_posts    | 9 columns  
-- user_settings      | 6 columns
-- user_access        | 7 columns
-- access_audit_logs  | 11 columns
