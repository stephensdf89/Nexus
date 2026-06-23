# Facebook Integration Setup Guide

## ✅ Configuration Complete

Your Facebook OAuth integration is now set up! Here's what was configured:

### Environment Variables (Already in `.env.local`)
```
FACEBOOK_CLIENT_ID=1010679554900124
FACEBOOK_CLIENT_SECRET=5a2b3ce61cfc4fd4e978a52d74ed808f
NEXTAUTH_URL=https://www.creatornexuspro.com
```

### What You Need To Do Now

#### 1. **Update Facebook App Settings**

Go to [Facebook Developer Console](https://developers.facebook.com/apps/):

1. Select your app (ID: `1010679554900124`)
2. Go to **Settings > Basic**
3. Set **App Domains**: `creatornexuspro.com`
4. Go to **Settings > Advanced** and enable Facebook Login
5. Go to **Facebook Login > Settings**
6. Set **Valid OAuth Redirect URIs**:
   ```
   https://www.creatornexuspro.com/api/integrations/facebook/callback
   ```

#### 2. **Create Database Table**

Run this SQL in your Supabase SQL editor:

```sql
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email VARCHAR NOT NULL,
  platform VARCHAR NOT NULL,
  platform_id VARCHAR NOT NULL,
  page_name VARCHAR,
  access_token TEXT NOT NULL,
  page_access_token TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_email, platform, platform_id)
);

CREATE INDEX IF NOT EXISTS idx_integrations_user_platform 
ON integrations(user_email, platform);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS integrations_user_policy ON integrations;
CREATE POLICY integrations_user_policy ON integrations
  FOR ALL USING (
    auth.uid()::text = (SELECT id::text FROM auth.users WHERE auth.users.email = integrations.user_email LIMIT 1)
  );
```

#### 3. **Test the Connection**

1. Deploy the latest changes to production
2. Log in to your dashboard
3. Go to **Settings > Connected Platforms**
4. Click the **Facebook "Connect"** button
5. Authorize your Facebook account
6. Select your Facebook page: `facebook.com/stephensdf89/`
7. Done! You'll see status as "Connected"

### API Routes Created

- `POST /api/integrations/facebook/auth` - Initiates OAuth flow
- `GET /api/integrations/facebook/callback` - Handles OAuth callback
- `GET /api/integrations/facebook/status` - Fetches connection status
- `POST /api/integrations/facebook/disconnect` - Removes connection

### Features Available Once Connected

✅ Fetch page analytics (views, engagement, reach)
✅ Create and schedule posts
✅ Fetch comments and messages
✅ Trigger pipelines on page events
✅ Auto-reply to comments with AI

### Scopes Requested from Facebook

- `pages_manage_metadata` - Manage page settings
- `pages_read_user_content` - Read page posts
- `pages_manage_posts` - Create/delete posts
- `pages_read_engagement` - Read metrics and comments

### Security Notes

- App Secret is **never** exposed to the client (server-side only)
- OAuth state token prevents CSRF attacks
- Access tokens stored securely in database
- Each page gets its own access token
- Tokens can be revoked anytime

### Next Steps

1. Run `npm run build` to compile
2. Commit and push changes
3. Netlify will auto-deploy
4. Test the Facebook connection in production
