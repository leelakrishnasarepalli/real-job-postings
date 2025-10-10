'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { CommentForm } from './CommentForm'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type CommentProps = {
  comment: {
    id: string
    content: string
    created_at: string
    user_id: string
    profiles: {
      username: string | null
      avatar_url: string | null
    } | null
  }
  currentUserId: string | null
  jobPostingId: string
  replies?: CommentProps['comment'][]
  depth?: number
}

export function Comment({
  comment,
  currentUserId,
  jobPostingId,
  replies = [],
  depth = 0,
}: CommentProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [voteType, setVoteType] = useState<'helpful' | 'not_helpful' | null>(null)
  const [helpfulCount, setHelpfulCount] = useState(0)
  const [isVoting, setIsVoting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Fetch existing vote and vote count for this comment
    const fetchVoteData = async () => {
      // Get user's vote if logged in
      if (currentUserId) {
        const { data: userVote } = await supabase
          .from('comment_votes')
          .select('vote_type')
          .eq('comment_id', comment.id)
          .eq('user_id', currentUserId)
          .single()

        if (userVote) {
          setVoteType(userVote.vote_type as 'helpful' | 'not_helpful')
        }
      }

      // Get total vote count
      const { data: votes } = await supabase
        .from('comment_votes')
        .select('vote_type')
        .eq('comment_id', comment.id)

      if (votes) {
        const helpful = votes.filter(v => v.vote_type === 'helpful').length
        const notHelpful = votes.filter(v => v.vote_type === 'not_helpful').length
        setHelpfulCount(helpful - notHelpful)
      }
    }

    fetchVoteData()
  }, [comment.id, currentUserId, supabase])

  const handleVote = async (type: 'helpful' | 'not_helpful') => {
    if (!currentUserId) return

    setIsVoting(true)

    try {
      if (voteType === type) {
        // Remove vote
        await supabase
          .from('comment_votes')
          .delete()
          .eq('comment_id', comment.id)
          .eq('user_id', currentUserId)

        setVoteType(null)
        setHelpfulCount(prev => prev + (type === 'helpful' ? -1 : 1))
      } else {
        // Add or update vote
        await supabase.from('comment_votes').upsert(
          {
            user_id: currentUserId,
            comment_id: comment.id,
            vote_type: type,
          },
          {
            onConflict: 'user_id,comment_id',
          }
        )

        const change = voteType === null ? 1 : 2
        setVoteType(type)
        setHelpfulCount(prev => prev + (type === 'helpful' ? change : -change))
      }

      router.refresh()
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const maxDepth = 3
  const canReply = depth < maxDepth

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-4' : ''}`}>
      <div className="border-l-2 border-gray-200 pl-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {comment.profiles?.avatar_url ? (
              <img
                src={comment.profiles.avatar_url}
                alt={comment.profiles.username || 'User'}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                {(comment.profiles?.username || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-medium text-gray-900">
              {comment.profiles?.username || 'Anonymous'}
            </span>
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>

          {currentUserId && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleVote('helpful')}
                disabled={isVoting}
                className={`p-1 rounded transition ${
                  voteType === 'helpful'
                    ? 'text-green-600'
                    : 'text-gray-400 hover:text-green-600'
                }`}
                title="Helpful"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
              </button>

              <button
                onClick={() => handleVote('not_helpful')}
                disabled={isVoting}
                className={`p-1 rounded transition ${
                  voteType === 'not_helpful'
                    ? 'text-red-600'
                    : 'text-gray-400 hover:text-red-600'
                }`}
                title="Not helpful"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                </svg>
              </button>

              <span className={`text-xs ml-1 font-medium ${
                helpfulCount > 0 ? 'text-green-600' : helpfulCount < 0 ? 'text-red-600' : 'text-gray-500'
              }`}>
                {helpfulCount > 0 ? '+' : ''}{helpfulCount}
              </span>
            </div>
          )}
        </div>

        <p className="text-gray-700 whitespace-pre-wrap mb-2">{comment.content}</p>

        {currentUserId && canReply && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-sm text-blue-600 hover:text-blue-700 transition"
          >
            Reply
          </button>
        )}

        {showReplyForm && currentUserId && (
          <div className="mt-3">
            <CommentForm
              jobPostingId={jobPostingId}
              parentCommentId={comment.id}
              userId={currentUserId}
              onSuccess={() => setShowReplyForm(false)}
              onCancel={() => setShowReplyForm(false)}
              placeholder="Write a reply..."
              buttonText="Post Reply"
            />
          </div>
        )}
      </div>

      {replies.length > 0 && (
        <div className="mt-2">
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              jobPostingId={jobPostingId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
