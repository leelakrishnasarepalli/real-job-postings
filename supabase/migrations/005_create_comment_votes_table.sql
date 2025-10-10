-- Create comment_vote_type enum
CREATE TYPE comment_vote_type AS ENUM ('helpful', 'not_helpful');

-- Create comment_votes table
CREATE TABLE IF NOT EXISTS public.comment_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
  vote_type comment_vote_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, comment_id)
);

-- Enable Row Level Security
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comment_votes
-- Anyone can view comment votes
CREATE POLICY "Comment votes are viewable by everyone"
  ON public.comment_votes FOR SELECT
  USING (true);

-- Authenticated users can create comment votes
CREATE POLICY "Authenticated users can create comment votes"
  ON public.comment_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comment votes
CREATE POLICY "Users can update own comment votes"
  ON public.comment_votes FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own comment votes
CREATE POLICY "Users can delete own comment votes"
  ON public.comment_votes FOR DELETE
  USING (auth.uid() = user_id);
