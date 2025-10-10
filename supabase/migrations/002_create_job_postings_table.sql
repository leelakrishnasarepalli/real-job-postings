-- Create job_type enum
CREATE TYPE job_type AS ENUM ('remote', 'hybrid', 'onsite');

-- Create job_status enum
CREATE TYPE job_status AS ENUM ('active', 'expired', 'filled');

-- Create job_postings table
CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  url TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT,
  category TEXT,
  location TEXT,
  job_type job_type DEFAULT 'remote',
  status job_status DEFAULT 'active',
  trust_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_postings
-- Anyone can view job postings
CREATE POLICY "Job postings are viewable by everyone"
  ON public.job_postings FOR SELECT
  USING (true);

-- Authenticated users can create job postings
CREATE POLICY "Authenticated users can create job postings"
  ON public.job_postings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own job postings
CREATE POLICY "Users can update own job postings"
  ON public.job_postings FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own job postings
CREATE POLICY "Users can delete own job postings"
  ON public.job_postings FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger for job_postings
CREATE TRIGGER job_postings_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
