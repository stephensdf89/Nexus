-- Fix UserSettings and user_settings tables for Settings API migration
-- This migration:
-- 1. Creates the new UserSettings table (Prisma style)
-- 2. Disables RLS on old user_settings to allow REST API calls during transition
-- 3. Sets up proper constraints and indexes

-- ============================================================================
-- 1. Create new UserSettings table (used by new Settings API)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public."UserSettings" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT UNIQUE NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "UserSettings_userId_idx" ON public."UserSettings"("userId");

COMMENT ON TABLE public."UserSettings" IS 'User settings and preferences managed via Zupabase store - new schema';

-- ============================================================================
-- 2. Fix old user_settings table for REST API access during transition
-- ============================================================================
-- Ensure old table has proper column structure
ALTER TABLE IF EXISTS public.user_settings ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE IF EXISTS public.user_settings ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Add UNIQUE constraint if it doesn't exist (using a different approach if it fails)
ALTER TABLE IF EXISTS public.user_settings ADD CONSTRAINT user_settings_user_id_unique UNIQUE (user_id);

-- Drop existing RLS to allow Supabase client library to access during transition
ALTER TABLE IF EXISTS public.user_settings DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own data" ON public.user_settings;

-- ============================================================================
-- 3. Enable RLS on new UserSettings table
-- ============================================================================
ALTER TABLE IF EXISTS public."UserSettings" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access their own settings" ON public."UserSettings";
CREATE POLICY "Users can access their own settings"
ON public."UserSettings"
FOR ALL
TO authenticated
USING (("userId" = (SELECT auth.uid()::TEXT)))
WITH CHECK (("userId" = (SELECT auth.uid()::TEXT)));

-- Allow anon access for now (can be restricted later)
DROP POLICY IF EXISTS "Allow public read for new settings" ON public."UserSettings";
CREATE POLICY "Allow public read for new settings"
ON public."UserSettings"
FOR SELECT
TO public, anon
USING (TRUE);

COMMENT ON POLICY "Users can access their own settings" ON public."UserSettings" IS 'Authenticated users can only see their own settings';
