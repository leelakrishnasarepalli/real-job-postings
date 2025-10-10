-- Trigger to update trust score when a vote is created, updated, or deleted
CREATE OR REPLACE FUNCTION update_trust_score_on_vote()
RETURNS TRIGGER AS $$
BEGIN
  -- Update trust score for the affected job posting
  UPDATE job_postings
  SET trust_score = calculate_trust_score(
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.job_posting_id
      ELSE NEW.job_posting_id
    END
  )
  WHERE id = CASE
    WHEN TG_OP = 'DELETE' THEN OLD.job_posting_id
    ELSE NEW.job_posting_id
  END;

  -- Update karma for the job posting owner
  UPDATE profiles
  SET karma_points = (
    SELECT COUNT(*) FILTER (WHERE v.vote_type = 'up') - COUNT(*) FILTER (WHERE v.vote_type = 'down')
    FROM votes v
    JOIN job_postings jp ON v.job_posting_id = jp.id
    WHERE jp.user_id = profiles.id
  )
  WHERE id = (
    SELECT user_id FROM job_postings
    WHERE id = CASE
      WHEN TG_OP = 'DELETE' THEN OLD.job_posting_id
      ELSE NEW.job_posting_id
    END
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER votes_update_trust_score
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION update_trust_score_on_vote();

-- Trigger to update trust score when a comment is created or deleted
CREATE OR REPLACE FUNCTION update_trust_score_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  -- Update trust score for the affected job posting
  UPDATE job_postings
  SET trust_score = calculate_trust_score(
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.job_posting_id
      ELSE NEW.job_posting_id
    END
  )
  WHERE id = CASE
    WHEN TG_OP = 'DELETE' THEN OLD.job_posting_id
    ELSE NEW.job_posting_id
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comments_update_trust_score
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_trust_score_on_comment();
