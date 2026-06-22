-- Create UserSettings table for Prisma ORM
-- Run this SQL in Supabase dashboard: https://supabase.com/dashboard/project/osaonkviokrhehmdjtyu/sql

CREATE TABLE IF NOT EXISTS "UserSettings" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT UNIQUE NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on userId for faster lookups
CREATE INDEX IF NOT EXISTS "UserSettings_userId_idx" ON "UserSettings"("userId");

-- Add comment to table
COMMENT ON TABLE "UserSettings" IS 'User settings and preferences managed via Zustand store';
