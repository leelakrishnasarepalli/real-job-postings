-- Function to calculate trust score for a job posting
CREATE OR REPLACE FUNCTION calculate_trust_score(job_id UUID)
RETURNS INTEGER AS $$
DECLARE
  upvotes INTEGER;
  downvotes INTEGER;
  net_votes INTEGER;
  comment_count INTEGER;
  age_hours NUMERIC;
  score INTEGER;
BEGIN
  -- Count votes
  SELECT COUNT(*) FILTER (WHERE vote_type = 'up') INTO upvotes
  FROM votes WHERE job_posting_id = job_id;

  SELECT COUNT(*) FILTER (WHERE vote_type = 'down') INTO downvotes
  FROM votes WHERE job_posting_id = job_id;

  net_votes := upvotes - downvotes;

  -- Count comments
  SELECT COUNT(*) INTO comment_count
  FROM comments WHERE job_posting_id = job_id;

  -- Calculate age in hours
  SELECT EXTRACT(EPOCH FROM (NOW() - created_at))/3600 INTO age_hours
  FROM job_postings WHERE id = job_id;

  -- Calculate score (Reddit-style hot ranking)
  -- Higher score = more popular and recent
  score := ROUND((net_votes + comment_count * 0.5) / POWER((age_hours + 2), 1.5));

  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to update karma points for a user
CREATE OR REPLACE FUNCTION update_karma_points(profile_id UUID)
RETURNS VOID AS $$
DECLARE
  total_upvotes INTEGER;
  total_downvotes INTEGER;
  karma INTEGER;
BEGIN
  -- Count upvotes on user's job postings
  SELECT COUNT(*) INTO total_upvotes
  FROM votes v
  JOIN job_postings jp ON v.job_posting_id = jp.id
  WHERE jp.user_id = profile_id AND v.vote_type = 'up';

  -- Count downvotes on user's job postings
  SELECT COUNT(*) INTO total_downvotes
  FROM votes v
  JOIN job_postings jp ON v.job_posting_id = jp.id
  WHERE jp.user_id = profile_id AND v.vote_type = 'down';

  -- Calculate karma (upvotes - downvotes)
  karma := total_upvotes - total_downvotes;

  -- Update user's karma_points
  UPDATE profiles
  SET karma_points = karma
  WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get vote counts for a job posting
CREATE OR REPLACE FUNCTION get_vote_counts(job_id UUID)
RETURNS TABLE (upvotes BIGINT, downvotes BIGINT, net_votes BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE vote_type = 'up') AS upvotes,
    COUNT(*) FILTER (WHERE vote_type = 'down') AS downvotes,
    COUNT(*) FILTER (WHERE vote_type = 'up') - COUNT(*) FILTER (WHERE vote_type = 'down') AS net_votes
  FROM votes
  WHERE job_posting_id = job_id;
END;
$$ LANGUAGE plpgsql;
