import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { commentText, jobPostingId } = await request.json()

    if (!commentText || !jobPostingId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      console.warn('OpenAI API key not configured, skipping sentiment analysis')
      return NextResponse.json({
        sentiment: 'neutral',
        shouldDownvote: false,
        message: 'Sentiment analysis not configured',
      })
    }

    // Call OpenAI API for sentiment analysis
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a sentiment analysis assistant. Analyze the sentiment of job posting comments and respond with ONLY one word: "positive", "negative", or "neutral". Consider comments about fake jobs, scams, or suspicious activity as negative.',
          },
          {
            role: 'user',
            content: `Analyze the sentiment of this comment about a job posting: "${commentText}"`,
          },
        ],
        temperature: 0.3,
        max_tokens: 10,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      return NextResponse.json({
        sentiment: 'neutral',
        shouldDownvote: false,
        message: 'Failed to analyze sentiment',
      })
    }

    const data = await response.json()
    const sentiment = data.choices[0]?.message?.content?.trim().toLowerCase() || 'neutral'

    // Validate sentiment value
    const validSentiment = ['positive', 'negative', 'neutral'].includes(sentiment)
      ? sentiment
      : 'neutral'

    // If sentiment is negative, automatically create a downvote
    let shouldDownvote = false
    if (validSentiment === 'negative') {
      // Check if user has already voted on this job
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('job_posting_id', jobPostingId)
        .single()

      // Only create downvote if user hasn't voted yet
      if (!existingVote) {
        const { error: voteError } = await supabase.from('votes').insert({
          user_id: user.id,
          job_posting_id: jobPostingId,
          vote_type: 'down',
        })

        if (!voteError) {
          shouldDownvote = true
        } else {
          console.error('Error creating downvote:', voteError)
        }
      }
    }

    return NextResponse.json({
      sentiment: validSentiment,
      shouldDownvote,
    })
  } catch (error) {
    console.error('Error analyzing sentiment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
