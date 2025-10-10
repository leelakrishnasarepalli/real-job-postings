# Real Job Postings Platform

A community-driven job board where users share and verify job postings through voting and AI-powered sentiment analysis. Built with Next.js 15, Supabase, and OpenAI.

[![Live Site](https://img.shields.io/badge/Live-realjobs.space-blue)](https://realjobs.space)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-orange)](https://openai.com/)

---

## 🎯 Features

### Core Functionality
- **🔐 Authentication**: Email/password and OAuth (Google, GitHub) via Supabase
- **📝 Job Posting**: Submit jobs by URL with automatic metadata extraction
- **👍 Voting System**: Community upvote/downvote to verify legitimacy
- **💬 Comments**: Threaded discussions with AI sentiment analysis
- **🎖️ Trust Scores**: Dynamic scoring based on community engagement
- **🔍 Search & Filters**: Full-text search with category, location, job type filters
- **👤 User Profiles**: Personal dashboards, bookmarks, and contribution stats

### Advanced Features
- **🤖 AI Sentiment Analysis**: OpenAI GPT-4o-mini analyzes comment sentiment
- **⬇️ Auto-Downvote**: Negative sentiment automatically flags suspicious jobs
- **🏷️ Time-Based Labels**: NEW (4h), TODAY, YESTERDAY, THIS WEEK
- **🔥 Smart Sorting**: Hot (trending), New, Top (most voted), Fake (downvoted)
- **📊 Real-Time Stats**: Live counts of jobs, verified postings, and users
- **🖼️ Avatar Upload**: Custom profile pictures with Supabase Storage
- **🔖 Bookmarks**: Save jobs for later review

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key (optional, for sentiment analysis)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/leelakrishnasarepalli/real-job-postings.git
cd real-job-postings
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# OpenAI Configuration (optional)
OPENAI_API_KEY=your-openai-api-key
```

4. **Set up Supabase database**

Run the migrations in `supabase/migrations/` in order:
- Go to Supabase Dashboard → SQL Editor
- Execute each migration file (001 through 012)

5. **Run development server**
```bash
npm run dev
```

Visit http://localhost:3000

---

## 📁 Project Structure

```
real-job-postings/
├── app/                      # Next.js 15 App Router
│   ├── api/                  # API routes
│   │   ├── analyze-sentiment/  # AI sentiment analysis
│   │   └── scrape-metadata/    # URL metadata extraction
│   ├── auth/                 # Authentication routes
│   ├── jobs/                 # Job listings and detail pages
│   ├── profile/              # User profiles
│   ├── bookmarks/            # Saved jobs
│   ├── settings/             # User settings
│   └── submit/               # Job submission form
├── components/               # Reusable React components
├── lib/                      # Utility libraries
├── supabase/migrations/      # Database migrations (001-012)
└── types/                    # TypeScript type definitions
```

---

## 🔧 Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Supabase** (Auth, Database, Storage)
- **OpenAI GPT-4o-mini** for sentiment analysis
- **Vercel** for hosting

---

## 📖 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Vercel deployment guide
- **[GITHUB_AUTH_SETUP.md](GITHUB_AUTH_SETUP.md)**: GitHub OAuth configuration
- **[CUSTOM_DOMAIN_SETUP.md](CUSTOM_DOMAIN_SETUP.md)**: Custom domain setup
- **[SENTIMENT_ANALYSIS_TEST.md](SENTIMENT_ANALYSIS_TEST.md)**: Testing AI features
- **[SORTING_EXPLAINED.md](SORTING_EXPLAINED.md)**: Sorting algorithms explained
- **[ENHANCEMENTS_SUMMARY.md](ENHANCEMENTS_SUMMARY.md)**: Feature summary

---

## 💰 Cost Estimate

### Free Tier
- **Vercel**: Free (100GB bandwidth)
- **Supabase**: Free (500MB database, 1GB storage)

### Paid
- **OpenAI API**: ~$0.02 per 1,000 comments
  - 1,000 comments/day: ~$0.60/month

**Total: ~$0.60/month for 1,000 comments/day**

---

## 🚢 Deployment

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel
4. Deploy!

See [DEPLOYMENT.md](DEPLOYMENT.md) for details.

---

## 🔒 Security

- Row Level Security (RLS) on all tables
- Environment variables for sensitive data
- Input validation with Zod
- XSS prevention in comments

---

## 📄 License

MIT License - Open source

---

Made with ❤️ using Next.js, Supabase, and OpenAI

**Live at**: https://realjobs.space
