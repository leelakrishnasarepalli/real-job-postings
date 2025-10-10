# Custom Domain Setup Guide: realjobs.space

This guide will walk you through connecting your GoDaddy domain `realjobs.space` to your Vercel deployment and updating Supabase.

---

## Step 1: Add Domain to Vercel

1. **Go to your Vercel project dashboard**:
   - Visit: https://vercel.com/dashboard
   - Select your `real-job-postings` project

2. **Navigate to Domains**:
   - Click on **Settings** tab
   - Click on **Domains** in the left sidebar

3. **Add your domain**:
   - Enter: `realjobs.space`
   - Click **Add**
   - Also add: `www.realjobs.space` (recommended)

4. **Vercel will provide DNS records**:
   - You'll see instructions to add DNS records
   - Keep this page open - you'll need these values

---

## Step 2: Configure DNS in GoDaddy

1. **Log into GoDaddy**:
   - Go to: https://dcc.godaddy.com/domains
   - Find `realjobs.space` and click **DNS**

2. **Add/Update DNS Records**:

   ### For Root Domain (realjobs.space):

   **Option A: Using A Record (Recommended)**
   - Type: `A`
   - Name: `@`
   - Value: `76.76.21.21` (Vercel's IP)
   - TTL: `600` seconds (or default)

   **Option B: Using CNAME (Alternative)**
   - Type: `CNAME`
   - Name: `@`
   - Value: `cname.vercel-dns.com`
   - TTL: `600` seconds

   ### For WWW Subdomain (www.realjobs.space):
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`
   - TTL: `600` seconds

3. **Remove conflicting records**:
   - Delete any existing A records pointing to old IPs
   - Delete any existing CNAME records for `@` or `www`
   - Keep MX records (email) if you have them

4. **Save changes**

**DNS Propagation**: Takes 5 minutes to 48 hours (usually within 15-30 minutes)

---

## Step 3: Verify Domain in Vercel

1. **Return to Vercel Domains page**
2. Wait for verification (Vercel checks DNS records automatically)
3. Once verified, you'll see:
   - ✅ Valid Configuration
   - SSL Certificate will be automatically provisioned

**Note**: SSL certificate takes 1-5 minutes to issue

---

## Step 4: Update Environment Variables in Vercel

1. **Go to Vercel Project Settings**:
   - Click **Settings** → **Environment Variables**

2. **Update NEXT_PUBLIC_SITE_URL**:
   - Find: `NEXT_PUBLIC_SITE_URL`
   - Click **Edit**
   - Change to: `https://realjobs.space`
   - Save

3. **Redeploy**:
   - Go to **Deployments** tab
   - Click the three dots (•••) on latest deployment
   - Click **Redeploy**

---

## Step 5: Update Supabase Authentication URLs

1. **Go to Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard/project/tbprhhlqvusvwxewahym

2. **Navigate to Authentication Settings**:
   - Click **Authentication** in left sidebar
   - Click **URL Configuration**

3. **Update Site URL**:
   - Find **Site URL**
   - Change to: `https://realjobs.space`

4. **Update Redirect URLs**:
   - Find **Redirect URLs**
   - Add these URLs (one per line):
     ```
     https://realjobs.space/auth/callback
     https://www.realjobs.space/auth/callback
     ```

5. **Save changes**

---

## Step 6: Test Your Setup

### Test Domain:
1. Visit: https://realjobs.space
2. Should load your application with SSL (🔒 padlock)

### Test WWW Redirect:
1. Visit: https://www.realjobs.space
2. Should redirect to https://realjobs.space

### Test Authentication:
1. Try to **Sign Up** or **Login**
2. Should redirect properly after authentication
3. No errors in browser console

### Test Deployment:
1. Make a small change to your app
2. Push to GitHub
3. Vercel auto-deploys
4. Check https://realjobs.space for updates

---

## Quick Reference: DNS Records

| Type  | Name | Value                  | TTL |
|-------|------|------------------------|-----|
| A     | @    | 76.76.21.21           | 600 |
| CNAME | www  | cname.vercel-dns.com  | 600 |

---

## Troubleshooting

### Domain not connecting?
- Wait 15-30 minutes for DNS propagation
- Use https://dnschecker.org to check if DNS has propagated globally
- Clear browser cache (Cmd/Ctrl + Shift + R)

### SSL Certificate not issued?
- Wait 5 minutes after DNS verification
- Vercel auto-issues certificates via Let's Encrypt
- Check Vercel dashboard for certificate status

### Authentication not working?
- Verify Supabase redirect URLs are correct
- Check browser console for errors
- Ensure `NEXT_PUBLIC_SITE_URL` matches your domain

### WWW not redirecting?
- Ensure CNAME record for `www` is correct
- Vercel automatically handles www → non-www redirect

---

## Environment Variables Summary

After setup, your `.env.local` and Vercel should have:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tbprhhlqvusvwxewahym.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://realjobs.space
OPENAI_API_KEY=your-openai-key
```

---

## Post-Setup Checklist

- [ ] Domain shows in Vercel with "Valid Configuration"
- [ ] SSL certificate issued (🔒 in browser)
- [ ] https://realjobs.space loads correctly
- [ ] https://www.realjobs.space redirects to main domain
- [ ] Sign up/Login works without errors
- [ ] `NEXT_PUBLIC_SITE_URL` updated in Vercel
- [ ] Supabase redirect URLs updated
- [ ] Application redeployed with new settings

---

## Support Links

- **Vercel Domains**: https://vercel.com/docs/concepts/projects/domains
- **GoDaddy DNS Help**: https://www.godaddy.com/help/manage-dns-records-680
- **Supabase Auth**: https://supabase.com/docs/guides/auth

---

Your custom domain `realjobs.space` should now be fully configured! 🎉
