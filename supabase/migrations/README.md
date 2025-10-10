# Database Migrations

This folder contains SQL migration files for setting up the Real Job Postings database schema in Supabase.

## How to Run Migrations

### Option 1: Using Supabase Dashboard (Recommended for beginners)

1. **Go to your Supabase project dashboard**
   - Navigate to https://supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "+ New query"

3. **Run migrations in order**
   - Copy and paste the content of each migration file in order (001, 002, 003, etc.)
   - Click "Run" for each migration
   - **Important**: Run them in numerical order!

### Option 2: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Migration Files Overview

1. **001_create_profiles_table.sql**
   - Creates `profiles` table
   - Sets up RLS policies
   - Creates trigger to auto-create profile on user signup

2. **002_create_job_postings_table.sql**
   - Creates `job_postings` table with enums (job_type, job_status)
   - Sets up RLS policies for CRUD operations

3. **003_create_votes_table.sql**
   - Creates `votes` table
   - Sets up RLS policies
   - Ensures one vote per user per job posting

4. **004_create_comments_table.sql**
   - Creates `comments` table with threading support
   - Sets up RLS policies

5. **005_create_comment_votes_table.sql**
   - Creates `comment_votes` table
   - Allows users to mark comments as helpful/not helpful

6. **006_create_bookmarks_table.sql**
   - Creates `bookmarks` table
   - Private to each user (RLS enforced)

7. **007_create_functions.sql**
   - `calculate_trust_score()` - Reddit-style hot ranking algorithm
   - `update_karma_points()` - Updates user karma based on votes
   - `get_vote_counts()` - Helper to get vote statistics

8. **008_create_indexes.sql**
   - Performance indexes on frequently queried columns
   - Full-text search index for job postings

9. **009_create_triggers.sql**
   - Auto-update trust score when votes/comments change
   - Auto-update user karma when their posts get voted on

## Database Schema Diagram

```
auth.users (Supabase managed)
    ↓
profiles
    ├── job_postings
    │   ├── votes
    │   ├── comments
    │   │   └── comment_votes
    │   └── bookmarks
```

## Key Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Public read access for job postings, comments, votes
- Users can only modify their own data
- Bookmarks are private to each user

### Trust Score Algorithm
- Based on upvotes, downvotes, and comments
- Time decay (recent posts ranked higher)
- Reddit-style "hot" ranking formula

### Automatic Updates
- Trust score updates automatically on vote/comment changes
- User karma updates automatically when their posts are voted on
- Profile creation triggered automatically on user signup

## Verification

After running all migrations, verify the setup:

```sql
-- Check all tables are created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Test trust score function
SELECT calculate_trust_score('some-job-posting-uuid');
```

## Troubleshooting

### Error: "relation already exists"
- This migration was already run. Skip to the next one.

### Error: "permission denied"
- Make sure you're using the Supabase dashboard or have proper permissions
- RLS policies might be blocking your query

### Foreign Key Errors
- Ensure migrations are run in order
- Tables must exist before creating foreign keys to them

## Next Steps

After running migrations:
1. Test user signup (should auto-create profile)
2. Create a test job posting
3. Test voting functionality
4. Verify trust score updates
