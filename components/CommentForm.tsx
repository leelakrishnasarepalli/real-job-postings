'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/Toast'

type CommentFormProps = {
  jobPostingId: string
  parentCommentId?: string
  userId: string
  onSuccess?: () => void
  onCancel?: () => void
  placeholder?: string
  buttonText?: string
}

const MAX_COMMENT_LENGTH = 500

export function CommentForm({
  jobPostingId,
  parentCommentId,
  userId,
  onSuccess,
  onCancel,
  placeholder = 'Share your thoughts about this job posting...',
  buttonText = 'Post Comment',
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      setError('Comment cannot be empty')
      return
    }

    if (content.length > MAX_COMMENT_LENGTH) {
      setError(`Comment must be ${MAX_COMMENT_LENGTH} characters or less`)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Analyze sentiment first
      let sentiment = 'neutral'
      try {
        const sentimentResponse = await fetch('/api/analyze-sentiment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            commentText: content.trim(),
            jobPostingId: jobPostingId,
          }),
        })

        if (sentimentResponse.ok) {
          const sentimentData = await sentimentResponse.json()
          sentiment = sentimentData.sentiment || 'neutral'
        }
      } catch (sentimentError) {
        console.error('Sentiment analysis failed:', sentimentError)
        // Continue with posting comment even if sentiment analysis fails
      }

      // Insert comment with sentiment
      const { data, error: insertError } = await supabase
        .from('comments')
        .insert({
          user_id: userId,
          job_posting_id: jobPostingId,
          parent_comment_id: parentCommentId || null,
          content: content.trim(),
          sentiment: sentiment,
        })
        .select('*, profiles!comments_user_id_fkey(username, avatar_url)')
        .single()

      if (insertError) throw insertError

      setContent('')
      showToast('success', sentiment === 'negative' ? 'Comment posted and flagged as negative' : 'Comment posted successfully!')
      onSuccess?.()
      router.refresh()
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to post comment'
      setError(errorMessage)
      showToast('error', errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
          {error}
        </div>
      )}

      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          maxLength={MAX_COMMENT_LENGTH}
          className="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={parentCommentId ? 3 : 4}
          disabled={isSubmitting}
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {content.length}/{MAX_COMMENT_LENGTH}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Posting...' : buttonText}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
