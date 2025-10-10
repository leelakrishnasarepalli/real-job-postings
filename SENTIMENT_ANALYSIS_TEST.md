# AI Sentiment Analysis Testing Guide

Complete guide to test and verify the AI sentiment analysis feature.

---

## ✅ Pre-requisites Checklist

Before testing, ensure these are set up:

### 1. Database Migration
The `sentiment` column must exist in the `comments` table.

**Verify in Supabase SQL Editor:**
```sql
-- Check if sentiment column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'comments' AND column_name = 'sentiment';
```

**Expected Result:**
```
column_name | data_type
sentiment   | character varying
```

**If missing, run this:**
```sql
ALTER TABLE comments
ADD COLUMN sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral'));

CREATE INDEX idx_comments_sentiment ON comments(sentiment);
```

### 2. OpenAI API Key
Your `.env.local` must have a valid OpenAI API key.

**Check:**
```bash
cat .env.local | grep OPENAI_API_KEY
```

**Should show:**
```
OPENAI_API_KEY=sk-proj-...
```

**Get API Key:**
1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-proj-` or `sk-`)
4. Add to `.env.local`
5. Restart dev server

### 3. Dev Server Running
```bash
npm run dev
```

---

## 🧪 Testing Steps

### Test 1: Verify API Endpoint

**Manual API Test (using curl):**

First, get your auth token:
1. Open browser dev tools (F12)
2. Go to http://localhost:3000/login
3. Sign in
4. In Console, run:
```javascript
const { data } = await supabase.auth.getSession()
console.log(data.session.access_token)
```
5. Copy the token

Then test the endpoint:
```bash
curl -X POST http://localhost:3000/api/analyze-sentiment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "commentText": "This is a scam! Fake job posting!",
    "jobPostingId": "some-job-id"
  }'
```

**Expected Response:**
```json
{
  "sentiment": "negative",
  "shouldDownvote": true
}
```

---

### Test 2: Comment with Positive Sentiment

1. **Go to any job posting**:
   - Visit: http://localhost:3000/jobs
   - Click on a job

2. **Post a positive comment**:
   ```
   This looks like a great opportunity! The company has excellent benefits and the role seems very promising.
   ```

3. **Verify**:
   - Comment should be posted successfully
   - Check browser Network tab (F12 → Network)
   - Look for call to `/api/analyze-sentiment`
   - Response should show: `"sentiment": "positive"`
   - **No auto-downvote** should be created

---

### Test 3: Comment with Negative Sentiment

1. **Go to any job posting**

2. **Post a negative comment**:
   ```
   This is a scam! I applied and they asked for money upfront. Definitely fake.
   ```

3. **Verify**:
   - Comment should be posted
   - Sentiment API should return: `"sentiment": "negative"`
   - **Auto-downvote should be created** on the job
   - Check the job's vote count (should decrease by 1)

4. **Verify in Database**:
```sql
-- Check the comment was saved with sentiment
SELECT id, content, sentiment, created_at
FROM comments
WHERE content LIKE '%scam%'
ORDER BY created_at DESC
LIMIT 1;

-- Check if downvote was created
SELECT v.*, c.content
FROM votes v
JOIN comments c ON c.job_posting_id = v.job_posting_id
WHERE v.vote_type = 'down'
AND c.content LIKE '%scam%'
ORDER BY v.created_at DESC
LIMIT 1;
```

---

### Test 4: Comment with Neutral Sentiment

1. **Post a neutral comment**:
   ```
   Anyone interviewed here? What was your experience?
   ```

2. **Verify**:
   - Sentiment should be: `"neutral"`
   - No auto-downvote created

---

### Test 5: Character Limit (500 chars)

1. **Try to post a long comment** (> 500 characters)

2. **Verify**:
   - Character counter shows: `XXX/500`
   - Cannot type beyond 500 characters (browser prevents it)
   - If you somehow bypass, server should reject

---

## 🔍 Debugging

### Check Browser Console

Open DevTools (F12) → Console

**Look for:**
```
Sentiment analysis failed: [error message]
```

### Check Network Tab

Open DevTools (F12) → Network

**Filter for:** `analyze-sentiment`

**Check:**
- Request payload has `commentText` and `jobPostingId`
- Response status: `200 OK`
- Response body has `sentiment` field

### Check Server Logs

In your terminal where dev server is running:

**Look for:**
```
OpenAI API error: [details]
```

**Common Issues:**

1. **"OpenAI API key not configured"**
   - Add `OPENAI_API_KEY` to `.env.local`
   - Restart dev server

2. **"401 Unauthorized" from OpenAI**
   - Invalid API key
   - Get new key from OpenAI dashboard

3. **"429 Too Many Requests"**
   - Rate limit exceeded
   - Wait a few minutes or upgrade OpenAI plan

4. **"Bucket not found"** (unrelated)
   - This is for avatars, not sentiment analysis
   - Can ignore for sentiment testing

---

## 📊 Test Scenarios

### Scenario 1: Spam Detection

**Comment:** "This is spam! Fake job! They're stealing information!"

**Expected:**
- Sentiment: `negative`
- Auto-downvote: ✅ Created
- Visible result: Job vote count decreases

### Scenario 2: Legitimate Concern

**Comment:** "I'm not sure about this company. Anyone have more information?"

**Expected:**
- Sentiment: `neutral` or `negative` (depends on OpenAI)
- Auto-downvote: Only if `negative`

### Scenario 3: Positive Review

**Comment:** "Great company! I work here and love the culture."

**Expected:**
- Sentiment: `positive`
- Auto-downvote: ❌ Not created

### Scenario 4: Mixed Sentiment

**Comment:** "The job looks okay, but the salary seems low for the requirements."

**Expected:**
- Sentiment: `neutral` (most likely)
- Auto-downvote: ❌ Not created

---

## 🎯 Success Criteria

✅ Sentiment analysis is working if:

1. **API responds** with sentiment value
2. **Negative comments** trigger auto-downvote
3. **Positive/neutral comments** don't trigger downvote
4. **Comments are saved** with sentiment in database
5. **500 character limit** is enforced
6. **No errors** in console or server logs

---

## 💰 Cost Monitoring

**OpenAI API Costs:**
- Model: `gpt-4o-mini` (latest ChatGPT mini model)
- Cost: ~$0.00015 per 1K input tokens, ~$0.0006 per 1K output tokens
- Average comment: ~100 input tokens, ~10 output tokens
- **Cost per comment: ~$0.00002** (60% cheaper than gpt-3.5-turbo!)

**Monitor usage:**
1. Go to: https://platform.openai.com/usage
2. Check daily usage
3. Set billing limits if needed

**Estimated costs:**
- 100 comments/day: ~$0.06/month
- 1,000 comments/day: ~$0.60/month
- 10,000 comments/day: ~$6/month

**Benefits of gpt-4o-mini:**
- 60% cheaper than gpt-3.5-turbo
- Faster response time
- More accurate sentiment analysis
- Latest model from OpenAI

---

## 🛠️ Troubleshooting

### Sentiment always returns "neutral"

**Possible causes:**
1. OpenAI API key missing/invalid
2. API returns error (check server logs)
3. Comment too short/unclear

**Solution:**
- Check `.env.local` has valid `OPENAI_API_KEY`
- Check server logs for OpenAI errors
- Try more explicit comments ("This is a scam!")

### Auto-downvote not working

**Check:**
1. Is sentiment actually `negative`? (check API response)
2. Has user already voted on this job? (only creates vote if user hasn't voted)
3. Check database for vote record

**Verify:**
```sql
SELECT * FROM votes
WHERE user_id = 'your-user-id'
AND job_posting_id = 'the-job-id'
ORDER BY created_at DESC;
```

### Character counter not showing

**Solution:**
- Hard refresh: Cmd/Ctrl + Shift + R
- Clear browser cache
- Check if component loaded correctly

---

## 📝 Quick Test Commands

### Test Database Migration
```sql
SELECT * FROM comments WHERE sentiment IS NOT NULL LIMIT 5;
```

### Test OpenAI Connection
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Check Recent Comments with Sentiment
```sql
SELECT
  id,
  LEFT(content, 50) as comment_preview,
  sentiment,
  created_at
FROM comments
ORDER BY created_at DESC
LIMIT 10;
```

### Check Auto-Downvotes
```sql
SELECT
  v.created_at,
  v.vote_type,
  c.content,
  c.sentiment
FROM votes v
JOIN comments c ON c.job_posting_id = v.job_posting_id
  AND c.user_id = v.user_id
WHERE v.vote_type = 'down'
  AND c.sentiment = 'negative'
ORDER BY v.created_at DESC
LIMIT 10;
```

---

## ✨ Feature Summary

**What happens when you post a comment:**

1. **User types comment** (max 500 chars)
2. **Submit** → Calls `/api/analyze-sentiment`
3. **OpenAI analyzes** → Returns sentiment
4. **If negative** → Creates downvote automatically
5. **Comment saved** with sentiment in database
6. **User sees** their comment posted

**Visual indicators:**
- Character counter: `XXX/500`
- Submitting state: "Posting..."
- Success: Comment appears in list
- Error: Red error message

---

Your sentiment analysis feature should now be fully working! 🎉

If you encounter issues, check the troubleshooting section or review the server logs.
