-- Indexes for job_postings table
CREATE INDEX idx_job_postings_user_id ON public.job_postings(user_id);
CREATE INDEX idx_job_postings_created_at ON public.job_postings(created_at DESC);
CREATE INDEX idx_job_postings_trust_score ON public.job_postings(trust_score DESC);
CREATE INDEX idx_job_postings_category ON public.job_postings(category);
CREATE INDEX idx_job_postings_job_type ON public.job_postings(job_type);
CREATE INDEX idx_job_postings_status ON public.job_postings(status);
CREATE INDEX idx_job_postings_created_trust ON public.job_postings(created_at DESC, trust_score DESC);

-- Indexes for votes table
CREATE INDEX idx_votes_job_posting_id ON public.votes(job_posting_id);
CREATE INDEX idx_votes_user_id ON public.votes(user_id);
CREATE INDEX idx_votes_created_at ON public.votes(created_at DESC);

-- Indexes for comments table
CREATE INDEX idx_comments_job_posting_id ON public.comments(job_posting_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_parent_comment_id ON public.comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);

-- Indexes for comment_votes table
CREATE INDEX idx_comment_votes_comment_id ON public.comment_votes(comment_id);
CREATE INDEX idx_comment_votes_user_id ON public.comment_votes(user_id);

-- Indexes for bookmarks table
CREATE INDEX idx_bookmarks_job_posting_id ON public.bookmarks(job_posting_id);
CREATE INDEX idx_bookmarks_created_at ON public.bookmarks(created_at DESC);

-- Indexes for profiles table
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_karma_points ON public.profiles(karma_points DESC);

-- Full-text search index for job postings
CREATE INDEX idx_job_postings_search ON public.job_postings
USING gin(to_tsvector('english', title || ' ' || company || ' ' || COALESCE(description, '')));
