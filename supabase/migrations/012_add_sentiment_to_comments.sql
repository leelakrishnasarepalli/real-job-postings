-- Add sentiment analysis field to comments table
ALTER TABLE comments
ADD COLUMN sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral'));

-- Add index for faster queries on sentiment
CREATE INDEX idx_comments_sentiment ON comments(sentiment);

-- Add comment
COMMENT ON COLUMN comments.sentiment IS 'AI-analyzed sentiment of the comment (positive, negative, neutral)';
