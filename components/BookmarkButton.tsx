'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

interface BookmarkButtonProps {
  jobId: string
  userId?: string
}

export function BookmarkButton({ jobId, userId }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    // Check if already bookmarked
    const checkBookmark = async () => {
      const { data } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .eq('job_posting_id', jobId)
        .single()

      setIsBookmarked(!!data)
    }

    checkBookmark()
  }, [userId, jobId])

  const toggleBookmark = async () => {
    if (!userId || loading) return

    setLoading(true)

    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('job_posting_id', jobId)

        if (error) throw error
        setIsBookmarked(false)
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: userId,
            job_posting_id: jobId,
          })

        if (error) throw error
        setIsBookmarked(true)
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!userId) return null

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      className={`px-3 py-1 rounded-md text-sm font-medium transition ${
        isBookmarked
          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this job'}
    >
      {isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
    </button>
  )
}
