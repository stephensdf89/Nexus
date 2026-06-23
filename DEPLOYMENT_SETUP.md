# Deployment Setup Guide - Creator Nexus Pro

This guide will help you deploy Creator Nexus Pro so other users can create accounts and access the platform from any device.

## Prerequisites

- Supabase account (free tier available at https://supabase.com)
- Netlify account (free tier available at https://netlify.com)
- GitHub repository (already configured)

---

## Step 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to https://app.supabase.com
2. Sign up or log in
3. Create a new project
4. Note down:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon Key** (public key for browser access)

### 1.2 Create Database Tables

Run the following SQL in Supabase SQL Editor (paste all at once):

```sql
-- Create integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  platform TEXT NOT NULL,
  platform_id TEXT,
  channel_name TEXT,
  thumbnail_url TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'neon',
  language TEXT DEFAULT 'en',
  region TEXT DEFAULT 'US',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create scheduled_posts table
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  user_email TEXT NOT NULL,
  platforms TEXT[] DEFAULT '{}',
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  scheduled_time TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_email ON integrations(user_email);
CREATE INDEX idx_integrations_platform ON integrations(platform);
CREATE INDEX idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX idx_scheduled_posts_email ON scheduled_posts(user_email);
CREATE INDEX idx_scheduled_posts_time ON scheduled_posts(scheduled_time);

-- Enable Row Level Security (RLS)
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own integrations"
  ON integrations FOR SELECT
  USING (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert their own integrations"
  ON integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can update their own integrations"
  ON integrations FOR UPDATE
  USING (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can delete their own integrations"
  ON integrations FOR DELETE
  USING (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own scheduled posts"
  ON scheduled_posts FOR SELECT
  USING (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert their own scheduled posts"
  ON scheduled_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can update their own scheduled posts"
  ON scheduled_posts FOR UPDATE
  USING (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can delete their own scheduled posts"
  ON scheduled_posts FOR DELETE
  USING (auth.uid() = user_id OR user_email = auth.jwt() ->> 'email');
```

### 1.3 Get Your Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy the **URL** (Project URL)
3. Copy the **anon key** (Anonymous Key)

---

## Step 2: Update Environment Variables

### 2.1 Local Development (Already Configured)

Update `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
DATABASE_URL=postgresql://postgres:password@your-project.supabase.co:5432/postgres
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
```

To generate NEXTAUTH_SECRET locally:
```bash
openssl rand -base64 32
```

### 2.2 Netlify Deployment

1. Go to your Netlify site dashboard
2. Click **Site settings** → **Build & deploy** → **Environment**
3. Add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
DATABASE_URL=postgresql://postgres:password@your-project.supabase.co:5432/postgres
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=https://your-site.netlify.app
```

**Important**: Use your actual Netlify URL (e.g., `https://your-site.netlify.app` or your custom domain)

### 2.3 Custom Domain (Optional)

If using a custom domain:
1. Set `NEXTAUTH_URL=https://www.yourdomain.com`
2. Configure the domain in Netlify DNS settings
3. Update Supabase redirect URLs (see Step 3)

---

## Step 3: Configure Supabase Auth Settings

### 3.1 Add Redirect URLs

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Add these redirect URLs:
   - `http://localhost:3000/**` (for local testing)
   - `https://your-site.netlify.app/**` (for Netlify)
   - `https://www.yourdomain.com/**` (if using custom domain)

### 3.2 Enable Email Auth

1. In Supabase, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled (it's enabled by default)
3. Configure email templates if desired

---

## Step 4: Deploy to Netlify

### 4.1 Connect GitHub Repository

1. Go to Netlify dashboard
2. Click **Add new site** → **Import an existing project**
3. Select your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: 20.9.0

### 4.2 Set Environment Variables (as shown in Step 2.2)

### 4.3 Deploy

Click **Deploy site**. Netlify will automatically build and deploy your site.

---

## Step 5: Verify Deployment

### 5.1 Test Sign Up

1. Go to your deployed site (e.g., `https://your-site.netlify.app`)
2. Click **Sign Up**
3. Create a test account
4. Verify you can log in
5. Verify you can access the dashboard

### 5.2 Test Multi-Device Access

1. Open the site on a different device (phone, tablet, etc.)
2. Create another account
3. Verify both users can access their own dashboards independently

### 5.3 Check Logs

If something fails:
- **Netlify**: Check **Deploys** → **Deploy log** for build errors
- **Supabase**: Check **Logs** → **API Gateway** for database errors
- **Browser Console**: Check for JavaScript errors (F12 → Console)

---

## Troubleshooting

### "Website can't be reached"
- ✅ Check Netlify deployment status (should say "Published")
- ✅ Verify custom domain is configured
- ✅ Wait 5-10 minutes for DNS to propagate if using custom domain

### "Invalid credentials" or Login fails
- ✅ Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Netlify environment
- ✅ Check that redirect URLs are added in Supabase settings
- ✅ Verify the Supabase project is active (check Supabase dashboard)

### "user_settings table doesn't exist"
- ✅ Run the SQL migration from Step 1.2
- ✅ Check that the table appears in Supabase **SQL Editor** → **Tables**

### Can't see other users' data
- ✅ This is correct! Row Level Security (RLS) policies ensure users only see their own data
- ✅ Each user logs in with their own email/password and only sees their integrations/posts

---

## Next Steps

### Production Optimization

1. **Set up Supabase backups** → Go to **Settings** → **Backups** → Enable automatic backups
2. **Enable Supabase monitoring** → Go to **Logs** → Monitor API usage
3. **Set up Netlify analytics** → Go to **Analytics** → Enable Netlify Analytics
4. **Configure custom domain** → Point your domain to Netlify

### Feature Expansion

Once deployment is working:

1. **Add OAuth providers** (YouTube, TikTok, Instagram, etc.) - See `/docs/OAUTH_SETUP.md`
2. **Enable email notifications** - Configure Supabase email templates
3. **Add payment processing** - Integrate Stripe for subscription features
4. **Set up analytics** - Install Google Analytics or Mixpanel

---

## Security Checklist

- ✅ NEXTAUTH_SECRET is set (not the default)
- ✅ Supabase RLS policies are enabled
- ✅ Environment variables are NOT in Git (use `.gitignore`)
- ✅ Only anon key is public (`NEXT_PUBLIC_*`), not service role key
- ✅ HTTPS is enabled (automatic on Netlify and Supabase)
- ✅ Database URL is not exposed to browser (kept server-side)

---

## Support

For issues, check:
- [Supabase Docs](https://supabase.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [Next.js Docs](https://nextjs.org/docs)

