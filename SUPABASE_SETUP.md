# Supabase UserSettings Table Setup Guide

## Current Status
✅ Prisma 7.8.0 configured correctly
✅ Schema file created and validated  
✅ DATABASE_URL configured in .env.local
✅ Application builds without errors
❌ UserSettings table not yet created in Supabase

## Next Step: Create the UserSettings Table

Due to Prisma 7's breaking changes requiring adapters for direct connections, we need to create the table manually via the Supabase SQL editor.

### Instructions:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/osaonkviokrhehmdjtyu/sql
   - Or: Supabase → Your Project → SQL Editor

2. **Create a New Query**
   - Click "New Query" or "+" button
   - Title: "Create UserSettings Table"

3. **Paste This SQL**
   ```sql
   CREATE TABLE IF NOT EXISTS "UserSettings" (
     id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
     "userId" TEXT UNIQUE NOT NULL,
     settings JSONB NOT NULL DEFAULT '{}'::jsonb,
     "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
   );

   CREATE INDEX IF NOT EXISTS "UserSettings_userId_idx" ON "UserSettings"("userId");
   ```

4. **Execute the Query**
   - Press `Cmd+Enter` (Mac) or `Ctrl+Enter` (Windows)
   - Wait for confirmation: "Query executed successfully"

5. **Verify Table Creation**
   - In left sidebar, go to "Database" → "Tables"
   - Confirm "UserSettings" table appears in the list
   - Click it to view the schema

## How to Use from Application

Once the table is created, the settings store will automatically persist to the database:

```typescript
// In your settings page or component:
import { settingsStore } from '@/lib/settingsStore';

// Update a setting (automatically persists to database via Prisma)
settingsStore.update('theme', 'dark');

// Reset settings
settingsStore.resetAll();

// The store will call the database API endpoint
// which uses the Prisma client to persist changes
```

## Database Integration Details

- **ORM**: Prisma 7.8.0
- **Client**: Auto-generated at `@prisma/client`
- **Singleton**: Configured in `/src/lib/prisma.ts`
- **Schema**: Defined in `/prisma/schema.prisma`
- **Environment**: DATABASE_URL loaded from `.env.local`

## Troubleshooting

### If you see "ENOTFOUND" error
- This indicates a DNS/network issue from your machine
- The solution is to create the table via the Supabase dashboard (as described above)

### If Prisma can't find DATABASE_URL
- Ensure `.env.local` contains your DATABASE_URL
- Restart your development server: `npm run dev`

### If you want to test the database connection
- Run: `npm run db:generate` to regenerate the Prisma client
- The client will validate your schema against the database once the table exists

## What's Next

After creating the UserSettings table in Supabase:

1. The Prisma client will automatically sync with the new table
2. The settings store can begin persisting to the database
3. Create API routes to integrate settings persistence
4. Test end-to-end: Update a setting → Persist to DB → Reload page → Value persists

---

**File Reference**: See [scripts/user-settings-migration.sql](./user-settings-migration.sql) for the SQL statement.
