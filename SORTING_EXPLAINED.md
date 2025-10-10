# Sorting Algorithms Explained

Understanding how each sorting option works in Real Job Postings.

---

## 🔥 Hot (Default)

**Algorithm**: Reddit-style "Hot" ranking

```
Hot Score = (Votes + Comments × 0.5) / (Age in Hours + 2)^1.5
```

**What it shows**:
- Jobs with recent activity (votes + comments)
- Balances popularity with recency
- Newer popular jobs rank higher than older popular jobs
- Great for finding trending opportunities

**Example**:
- Job A: 10 votes, 5 comments, posted 2 hours ago → High hot score
- Job B: 20 votes, 2 comments, posted 5 days ago → Lower hot score
- **Job A appears first** (despite fewer total votes)

---

## ✨ New

**Algorithm**: Simple chronological sort

```
Sort by: created_at (descending)
```

**What it shows**:
- Most recently posted jobs first
- Ignore votes and comments entirely
- Perfect for finding the latest opportunities
- See jobs as they're posted

**Example**:
- Job A: Posted 10 minutes ago, 0 votes
- Job B: Posted 2 days ago, 50 votes
- **Job A appears first** (newest)

---

## ⭐ Top

**Algorithm**: Net votes ranking

```
Sort by: (Upvotes - Downvotes) descending
```

**What it shows**:
- Jobs with the most community approval
- Best for finding highly-rated opportunities
- Ignores recency completely
- Best jobs of all time

**Example**:
- Job A: 100 upvotes, 5 downvotes = 95 net votes
- Job B: 30 upvotes, 2 downvotes = 28 net votes
- **Job A appears first** (highest net votes)

---

## 🚫 Fake

**Algorithm**: Most downvoted (top 50%)

```
1. Filter jobs with at least 1 downvote
2. Sort by downvotes (descending)
3. Show top 50% of downvoted jobs
```

**What it shows**:
- Community-flagged suspicious jobs
- Jobs with most downvotes
- Helps identify scams and fake postings
- Only shows jobs that have been downvoted

**Example**:
- Job A: 2 upvotes, 15 downvotes
- Job B: 5 upvotes, 10 downvotes
- Job C: 20 upvotes, 0 downvotes
- **Result**: Shows A and B only (C not downvoted), A appears first

---

## Why You Might Not See Differences

### 1. Not Enough Data

If you have:
- Few jobs (< 5)
- No votes on any jobs
- No comments on any jobs
- All jobs posted at similar times

**Solution**: Add some test data with votes to see differences

### 2. All Jobs Have Similar Scores

If all jobs have:
- 0 votes
- 0 comments
- Posted within minutes of each other

Then all sorting will look similar!

### 3. Fake Category Shows Nothing

This is normal if:
- No jobs have downvotes yet
- Community hasn't flagged any jobs

---

## Testing the Sorting

### Quick Test: Add Votes

1. **Create 3-5 jobs** with different content
2. **Add votes**:
   - Job 1: Give it 5 upvotes
   - Job 2: Give it 2 downvotes
   - Job 3: Give it 1 upvote, 1 comment
   - Job 4: No votes (brand new)
   - Job 5: Old job with 3 upvotes

3. **Test each sort**:

**Hot**: Should show Job 3 (recent with activity) or Job 4 (newest)
**New**: Should show Job 4 first (most recent)
**Top**: Should show Job 1 first (most votes)
**Fake**: Should show Job 2 (only downvoted job)

---

## Visual Comparison

| Sort | Priority | Best For |
|------|----------|----------|
| 🔥 **Hot** | Activity × Recency | Finding trending jobs right now |
| ✨ **New** | Recency only | Finding latest postings |
| ⭐ **Top** | Total votes | Finding best jobs of all time |
| 🚫 **Fake** | Most downvotes | Identifying scams and fakes |

---

## Technical Details

### Hot Algorithm Breakdown

```javascript
const age = (now - created_at) / (1000 * 60 * 60) // Convert to hours
const hotScore = (voteCount + commentCount * 0.5) / Math.pow(age + 2, 1.5)
```

- **Why +2?** Prevents division by zero for brand new jobs
- **Why ^1.5?** Balances recency vs popularity (Reddit's proven formula)
- **Why comments × 0.5?** Votes are more important than comments

### Example Hot Scores

| Job | Votes | Comments | Age (hrs) | Hot Score | Rank |
|-----|-------|----------|-----------|-----------|------|
| A   | 10    | 4        | 1         | 2.38      | 1st  |
| B   | 20    | 2        | 24        | 0.65      | 3rd  |
| C   | 15    | 6        | 5         | 1.22      | 2nd  |

Even though B has most votes, A ranks higher due to recency!

---

## Adding Test Data

### Via UI:
1. Sign up with multiple accounts
2. Submit jobs from different accounts
3. Vote/comment on jobs from different accounts

### Via SQL (Supabase Dashboard):
```sql
-- Add upvote
INSERT INTO votes (user_id, job_posting_id, vote_type)
VALUES ('your-user-id', 'job-id', 'up');

-- Add downvote
INSERT INTO votes (user_id, job_posting_id, vote_type)
VALUES ('your-user-id', 'job-id', 'down');

-- Add comment
INSERT INTO comments (user_id, job_posting_id, content)
VALUES ('your-user-id', 'job-id', 'Great opportunity!');
```

---

## Summary

The sorting should now be **very different**:

- **Hot** → Trending (mix of votes, comments, recency)
- **New** → Chronological (newest first)
- **Top** → Best rated (most upvotes - downvotes)
- **Fake** → Suspicious (most downvoted)

If they still look the same, you need more varied data (different vote counts, ages, etc.)!
