# Deployment Guide - Real Job Postings

## Prerequisites
- GitHub account
- Vercel account (free tier)
- Supabase project
- Custom domain (optional)
- OpenAI API key (for sentiment analysis feature)

## Steps to Deploy on Vercel (Free Tier)

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Connect Vercel to GitHub
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js configuration

### 3. Configure Environment Variables
In Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
OPENAI_API_KEY=sk-your-openai-key
```

### 4. Deploy
- Click "Deploy"
- Vercel will build and deploy automatically
- You'll get a `.vercel.app` URL

### 5. Add Custom Domain (Optional)
1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_SITE_URL` to your custom domain

### 6. Update Supabase Configuration
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to:
   - Site URL: `https://your-domain.vercel.app`
   - Redirect URLs: `https://your-domain.vercel.app/auth/callback`

## Continuous Deployment
- Every push to `main` branch auto-deploys
- Preview deployments for pull requests
- Instant rollbacks available in Vercel dashboard

## Monitoring
- View logs in Vercel dashboard
- Monitor performance with Vercel Analytics (free)
- Check Supabase dashboard for database metrics

## Cost Breakdown
- **Vercel**: Free tier (100GB bandwidth, unlimited requests)
- **Supabase**: Free tier (500MB database, 1GB file storage, 2GB bandwidth)
- **OpenAI**: Pay-as-you-go (estimated $0.01-0.05 per 1000 comments analyzed)

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify Next.js version compatibility

### Authentication Issues
- Verify Supabase redirect URLs match Vercel domain
- Check environment variables are correct
- Clear browser cache and cookies

### Database Connection Issues
- Check Supabase project status
- Verify RLS policies are enabled
- Test connection locally first
