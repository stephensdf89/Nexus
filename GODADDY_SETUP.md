# GoDaddy DNS Setup for creatornexuspro.com

## Step 1: Log into GoDaddy
1. Go to: https://www.godaddy.com
2. Sign in with your account
3. Click: **Products** (top left)
4. Click: **Domains**
5. Find and click: **creatornexuspro.com**

## Step 2: Update Nameservers

1. On your domain page, look for **Nameservers** section
2. Click: **Change Nameservers** or **Manage DNS**
3. Select: **I'll use custom nameservers (I have specific nameservers I want to use)**
4. Enter these Netlify nameservers:

```
dns1.p01.nsone.net
dns2.p01.nsone.net
dns3.p01.nsone.net
dns4.p01.nsone.net
```

5. Click: **Save**

## Step 3: Wait for Propagation

DNS changes can take **10-30 minutes** to propagate globally.

During this time:
- You'll see "pending" status on Netlify
- The site will still be accessible via: https://contentcreatornexus.netlify.app
- Once propagated, both will work:
  - https://creatornexuspro.com (via GoDaddy)
  - https://contentcreatornexus.netlify.app (Netlify backup)

## Step 4: Verify Setup (After 15-30 minutes)

1. Go to: https://app.netlify.com/sites/contentcreatornexus/settings/domain
2. Check the status - should say ✅ **Verified**
3. Test the site: https://creatornexuspro.com

## If It Doesn't Work:

**Common issues:**
- DNS not updated yet (wait 30 min and refresh)
- Nameservers entered incorrectly (check spacing, no typos)
- Old DNS cached (try incognito/private browser window)

**Check DNS status:**
Run this in terminal: `nslookup creatornexuspro.com`
Should show the Netlify IP addresses

---

## Once Configured ✅

Users will be able to access:
- https://creatornexuspro.com (your primary domain)
- https://creatornexuspro.com/signup (sign up page)
- https://creatornexuspro.com/dashboard (dashboard)

And all features will work from any device!
