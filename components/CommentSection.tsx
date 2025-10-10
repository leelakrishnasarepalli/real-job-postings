'use client'

import { useEffect, useState } from 'react'
import { Comment } from './Comment'
import { CommentForm } from './CommentForm'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type CommentData = {
  id: string
  content: string
  created_at: string
  user_id: string
  parent_comment_id: string | null
  profiles: {
    username: string | null
    avatar_url: string | null
  } | null
}

type CommentSectionProps = {
  jobPostingId: string
  initialComments: CommentData[]
  currentUserId: string | null
}

export function CommentSection({
  jobPostingId,
  initialComments,
  currentUserId,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to new comments
    const channel = supabase
      .channel(`job:${jobPostingId}:comments`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `job_posting_id=eq.${jobPostingId}`,
        },
        async (payload) => {
          // Fetch the new comment with profile data
          const { data: newComment } = await supabase
            .from('comments')
            .select('*, profiles!comments_user_id_fkey(username, avatar_url)')
            .eq('id', payload.new.id)
            .single()

          if (newComment) {
            setComments((prev) => [newComment, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [jobPostingId, supabase])

  // Organize comments into a tree structure
  const organizeComments = (comments: CommentData[]) => {
    const commentMap = new Map<string, CommentData & { replies: CommentData[] }>()
    const rootComments: (CommentData & { replies: CommentData[] })[] = []

    // First pass: create map of all comments
    comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })

    // Second pass: organize into tree
    comments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id)!

      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id)
        if (parent) {
          parent.replies.push(commentWithReplies)
        } else {
          rootComments.push(commentWithReplies)
        }
      } else {
        rootComments.push(commentWithReplies)
      }
    })

    return rootComments
  }

  const organizedComments = organizeComments(comments)

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Comments ({comments.length})
      </h3>

      {currentUserId ? (
        <div className="mb-8">
          <CommentForm
            jobPostingId={jobPostingId}
            userId={currentUserId}
            onSuccess={() => {
              // Refresh to show new comment immediately
              window.location.reload()
            }}
          />
        </div>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-md text-center">
          <p className="text-gray-600">
            <Link href="/login" className="text-blue-600 hover:text-blue-700">
              Sign in
            </Link>{' '}
            to comment
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {organizedComments.length > 0 ? (
          organizedComments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              jobPostingId={jobPostingId}
              replies={comment.replies}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  )
}
