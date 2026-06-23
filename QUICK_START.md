# 🚀 Quick Setup Checklist - Creator Nexus Pro

Follow these steps in order to get your platform live for other users to sign up, log in, and view their content.

## ✅ Phase 1: Local Development (5 minutes)

- [ ] Clone repository: `git clone [your-repo-url]`
- [ ] Install dependencies: `npm install`
- [ ] Update `.env.local` with your Supabase credentials:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
  DATABASE_URL=postgresql://...
  NEXTAUTH_SECRET=xxxxx (generate with: openssl rand -base64 32)
  NEXTAUTH_URL=http://localhost:3000
  ```
- [ ] Test locally: `npm run dev`
- [ ] Visit `http://localhost:3000` and test sign up/login

## ✅ Phase 2: Supabase Setup (10 minutes)

### Create Project
- [ ] Go to https://app.supabase.com
- [ ] Create new project
- [ ] Wait for provisioning (2-3 minutes)
- [ ] Copy Project URL and Anon Key

### Create Database Tables
- [ ] Open Supabase **SQL Editor**
- [ ] Copy & paste entire content from `scripts/database-migration.sql`
- [ ] Execute the query
- [ ] Verify all 3 tables created (integrations, user_settings, scheduled_posts)

### Configure Authentication
- [ ] Go to **Authentication** → **URL Configuration**
- [ ] Add redirect URLs:
  - `http://localhost:3000/**` (local testing)
  - `https://your-netlify-site.netlify.app/**` (or your custom domain)
- [ ] Verify **Email** provider is enabled in **Providers**

## ✅ Phase 3: Netlify Deployment (15 minutes)

### Connect Repository
- [ ] Go to https://app.netlify.com
- [ ] Click **Add new site** → **Import an existing project**
- [ ] Choose your GitHub repository
- [ ] Build settings:
  - Build command: `npm run build`
  - Publish directory: `.next`
  - Node version: 20.9.0

### Set Environment Variables
In Netlify **Site settings** → **Build & deploy** → **Environment**, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=xxxxx (same as local)
NEXTAUTH_URL=https://your-site.netlify.app
```

- [ ] Click **Deploy site**
- [ ] Wait for build to complete (2-3 minutes)

## ✅ Phase 4: Verification (5 minutes)

### Test Sign Up (First Device)
- [ ] Go to your Netlify URL: `https://your-site.netlify.app`
- [ ] Click **Sign Up**
- [ ] Create account: `user1@example.com` / `TestPass123!`
- [ ] Verify redirected to dashboard
- [ ] Verify you see "Creator Tools", "Analytics", etc.

### Test Multi-Device/Multi-User
- [ ] Open site on different device (or phone)
- [ ] Create second account: `user2@example.com` / `TestPass456!`
- [ ] Log in as user1 (should see only user1's data)
- [ ] Log in as user2 (should see only user2's data)
- [ ] ✅ If both users see separate dashboards, you're done!

### If Something Fails
- [ ] Check Netlify deploy log: **Deploys** → Click latest → **Deploy log**
- [ ] Check browser console: F12 → **Console** tab
- [ ] Check Supabase logs: **Logs** → **API Gateway**
- [ ] Common issues:
  - "Can't reach website" → Wait 5 min for DNS, check Netlify status
  - "Invalid credentials" → Verify Supabase env vars match
  - "user_settings not found" → Run SQL migration from Phase 2

## ✅ Phase 5: Custom Domain (Optional, 10 minutes)

- [ ] In Netlify **Site settings** → **Domain management** → **Add custom domain**
- [ ] Update your domain DNS pointing to Netlify
- [ ] Update `NEXTAUTH_URL` in Netlify environment to `https://yourdomain.com`
- [ ] Update redirect URLs in Supabase to include `https://yourdomain.com/**`
- [ ] Wait 24 hours for DNS propagation

---

## 📊 Success Indicators

After completion, verify:

✅ Multiple users can create accounts  
✅ Users can log in independently  
✅ Each user sees only their own data  
✅ Site is accessible from different devices  
✅ Dashboard shows "Creator Tools", "Analytics", "Notifications", etc.  
✅ No "website can't be reached" errors  

---

## 📞 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Website can't be reached" | Check Netlify deploy status, wait 5 min, refresh |
| "Invalid email or password" | Verify Supabase credentials in Netlify env |
| "user_settings table not found" | Run SQL migration from `scripts/database-migration.sql` |
| "ReferenceError: fetch is not defined" | Use Node 18+ (Netlify uses 20.9.0 by default) |
| Users see other users' data | Check RLS policies were applied in Supabase |
| Login redirects to login again | Check `NEXTAUTH_URL` matches your domain |

---

## 🎯 Next Steps

After deployment:

1. **Invite beta users** → Share your Netlify URL with friends to test
2. **Monitor analytics** → Check Supabase logs for errors
3. **Add OAuth platforms** → Connect YouTube, TikTok, Instagram (see OAUTH_SETUP.md)
4. **Custom branding** → Update logo, colors, domain name
5. **Enable SSL** → Automatic on Netlify, verify HTTPS works

---

**Estimated Total Time: 45 minutes**

Need help? Check:
- https://supabase.com/docs
- https://docs.netlify.com
- https://nextjs.org/docs
