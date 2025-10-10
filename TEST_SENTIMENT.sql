-- Quick verification and test for sentiment analysis feature

-- 1. Check if sentiment column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'comments' AND column_name = 'sentiment';

-- Expected: sentiment | character varying | YES

-- 2. If column doesn't exist, create it (run this in Supabase SQL Editor)
-- ALTER TABLE comments
-- ADD COLUMN sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral'));
-- CREATE INDEX idx_comments_sentiment ON comments(sentiment);

-- 3. Check recent comments with sentiment
SELECT
  id,
  LEFT(content, 60) as comment_preview,
  sentiment,
  created_at,
  user_id
FROM comments
ORDER BY created_at DESC
LIMIT 10;

-- 4. Count comments by sentiment
SELECT
  sentiment,
  COUNT(*) as count
FROM comments
GROUP BY sentiment
ORDER BY count DESC;

-- 5. Check if auto-downvotes are working (negative comments that created downvotes)
SELECT
  c.id as comment_id,
  LEFT(c.content, 50) as comment,
  c.sentiment,
  c.created_at as comment_time,
  v.id as vote_id,
  v.vote_type,
  v.created_at as vote_time
FROM comments c
LEFT JOIN votes v ON
  c.job_posting_id = v.job_posting_id
  AND c.user_id = v.user_id
  AND v.vote_type = 'down'
  AND v.created_at >= c.created_at
  AND v.created_at <= c.created_at + INTERVAL '5 seconds'
WHERE c.sentiment = 'negative'
ORDER BY c.created_at DESC
LIMIT 10;

-- 6. Test data: Find jobs to comment on
SELECT
  id,
  title,
  company,
  created_at
FROM job_postings
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 5;
