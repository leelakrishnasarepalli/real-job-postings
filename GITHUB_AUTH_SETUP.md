# GitHub Authentication Setup Guide

Complete guide to enable GitHub login for your Real Job Postings platform.

---

## Part 1: Create GitHub OAuth App

### Step 1: Go to GitHub Developer Settings

1. **Visit GitHub Settings**:
   - Go to: https://github.com/settings/developers
   - Or: GitHub → Settings → Developer settings → OAuth Apps

2. **Click "New OAuth App"**

### Step 2: Configure OAuth App

Fill in the application details:

**For Development (localhost):**
```
Application name: Real Job Postings (Development)
Homepage URL: http://localhost:3000
Authorization callback URL: https://tbprhhlqvusvwxewahym.supabase.co/auth/v1/callback
Application description: Community-driven job board (optional)
```

**For Production (realjobs.space):**
```
Application name: Real Job Postings
Homepage URL: https://realjobs.space
Authorization callback URL: https://tbprhhlqvusvwxewahym.supabase.co/auth/v1/callback
Application description: Community-driven job board (optional)
```

**Important**: The callback URL is **always** your Supabase project URL with `/auth/v1/callback`, NOT your application URL!

### Step 3: Get Client ID and Secret

1. **After creating the app**, you'll see:
   - **Client ID**: Copy this (looks like: `Iv1.1234567890abcdef`)
   - Click **"Generate a new client secret"**
   - **Client Secret**: Copy this immediately (you won't see it again!)

2. **Save both values** - you'll need them for Supabase

---

## Part 2: Configure Supabase

### Step 1: Enable GitHub Provider

1. **Go to Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard/project/tbprhhlqvusvwxewahym

2. **Navigate to Authentication**:
   - Click **Authentication** in left sidebar
   - Click **Providers**
   - Scroll to find **GitHub**

3. **Enable GitHub**:
   - Toggle **Enable GitHub** to ON
   - Enter your GitHub OAuth credentials:
     - **Client ID**: Paste from GitHub OAuth App
     - **Client Secret**: Paste from GitHub OAuth App
   - Click **Save**

### Step 2: Verify Redirect URLs

1. **Still in Authentication Settings**:
   - Click **URL Configuration**

2. **Check Site URL**:
   - For development: `http://localhost:3000`
   - For production: `https://realjobs.space`

3. **Check Redirect URLs** (Add all that apply):
   ```
   http://localhost:3000/auth/callback
   https://realjobs.space/auth/callback
   https://www.realjobs.space/auth/callback
   https://real-job-postings-git-main-leela-krishna-sarepallis-projects.vercel.app/auth/callback
   ```

4. **Save changes**

---

## Part 3: Test GitHub Authentication

### Test on Development (localhost:3000)

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Go to login page**:
   - Visit: http://localhost:3000/login

3. **Click "GitHub" button**:
   - Should redirect to GitHub authorization page
   - Authorize the app
   - Should redirect back to your app
   - You should be logged in!

### Test on Production (realjobs.space)

1. **After domain setup**, visit: https://realjobs.space/login

2. **Click "GitHub" button**:
   - Should work the same as development

---

## Part 4: Create Production OAuth App (Recommended)

For better security, create a separate OAuth app for production:

1. **Create another OAuth App** on GitHub
2. **Use production URL**:
   ```
   Application name: Real Job Postings
   Homepage URL: https://realjobs.space
   Authorization callback URL: https://tbprhhlqvusvwxewahym.supabase.co/auth/v1/callback
   ```

3. **Update Supabase** with production credentials

---

## Troubleshooting

### Error: "Redirect URI mismatch"

**Problem**: GitHub callback URL doesn't match

**Solution**:
- Double-check callback URL in GitHub OAuth App settings
- Must be exactly: `https://tbprhhlqvusvwxewahym.supabase.co/auth/v1/callback`
- NOT your app URL!

### Error: "Invalid client credentials"

**Problem**: Client ID or Secret is wrong

**Solution**:
- Regenerate Client Secret in GitHub
- Copy the new secret
- Update in Supabase → Authentication → Providers → GitHub

### GitHub button does nothing

**Problem**: JavaScript error or Supabase not configured

**Solution**:
1. Check browser console for errors (F12)
2. Verify Supabase environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tbprhhlqvusvwxewahym.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
   ```
3. Restart dev server: `npm run dev`

### User logged in but no profile created

**Problem**: Trigger not creating profile for OAuth users

**Solution**: Check if trigger exists in Supabase:
```sql
-- Run this in Supabase SQL Editor
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

If missing, create it:
```sql
-- Create trigger to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, created_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'user_name', new.email),
    new.created_at
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Authentication works but redirects to wrong URL

**Problem**: Site URL or redirect URL misconfigured

**Solution**:
1. Check Supabase → Authentication → URL Configuration
2. Ensure Site URL matches your domain
3. Ensure redirect URLs include your domain + `/auth/callback`

---

## Quick Reference

### GitHub OAuth App URLs

| Environment | Homepage URL | Callback URL |
|-------------|--------------|--------------|
| Development | http://localhost:3000 | https://tbprhhlqvusvwxewahym.supabase.co/auth/v1/callback |
| Production | https://realjobs.space | https://tbprhhlqvusvwxewahym.supabase.co/auth/v1/callback |

### Supabase Redirect URLs to Add

```
http://localhost:3000/auth/callback
https://realjobs.space/auth/callback
https://www.realjobs.space/auth/callback
```

---

## Testing Checklist

- [ ] GitHub OAuth App created
- [ ] Client ID and Secret saved
- [ ] GitHub provider enabled in Supabase
- [ ] Client ID and Secret entered in Supabase
- [ ] Redirect URLs configured in Supabase
- [ ] Test login on localhost works
- [ ] User profile auto-created after login
- [ ] Test login on production domain works
- [ ] User can log out and log back in

---

## Support Links

- **GitHub OAuth Apps**: https://github.com/settings/developers
- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth/social-login/auth-github
- **OAuth Flow Diagram**: https://supabase.com/docs/guides/auth/social-login

---

Your GitHub authentication should now be working! 🎉

If you still have issues, check the browser console (F12) for specific error messages.
