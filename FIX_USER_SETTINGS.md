# How to Fix UserSettings Table in Supabase

The database migration needs to be run manually through the Supabase dashboard.

## Steps:

1. Go to: https://supabase.com/dashboard/project/osaonkviokrhehmdjtyu/sql/new

2. Copy and paste the entire SQL from `scripts/user-settings-migration.sql`:

```sql
CREATE TABLE IF NOT EXISTS "UserSettings" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT UNIQUE NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "UserSettings_userId_idx" ON "UserSettings"("userId");

COMMENT ON TABLE "UserSettings" IS 'User settings and preferences managed via Zustand store';
```

3. Click "Run" to execute the SQL

4. Once complete, the settings API will be able to work with the table.

This creates:
- `UserSettings` table with proper structure
- `userId` as a UNIQUE column (required for the REST API)
- JSONB `settings` column for storing user preferences
- Index for faster lookups

After running this, the settings API will work and you should be able to see the Facebook integration status correctly.
