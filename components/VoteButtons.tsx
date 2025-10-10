'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type VoteButtonsProps = {
  jobId: string
  initialVoteCount: number
  userId: string | null
}

export function VoteButtons({ jobId, initialVoteCount, userId }: VoteButtonsProps) {
  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    // Fetch user's existing vote
    const fetchUserVote = async () => {
      const { data } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('job_posting_id', jobId)
        .eq('user_id', userId)
        .single()

      if (data) {
        setUserVote(data.vote_type as 'up' | 'down')
      }
    }

    fetchUserVote()
  }, [jobId, userId, supabase])

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!userId) {
      router.push('/login')
      return
    }

    setIsVoting(true)

    try {
      // If clicking the same vote, remove it
      if (userVote === voteType) {
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('job_posting_id', jobId)
          .eq('user_id', userId)

        if (error) throw error

        setUserVote(null)
        setVoteCount(voteCount + (voteType === 'up' ? -1 : 1))
      } else {
        // If changing vote or new vote
        const { error } = await supabase.from('votes').upsert(
          {
            user_id: userId,
            job_posting_id: jobId,
            vote_type: voteType,
          },
          {
            onConflict: 'user_id,job_posting_id',
          }
        )

        if (error) throw error

        // Update vote count
        if (userVote === null) {
          // New vote
          setVoteCount(voteCount + (voteType === 'up' ? 1 : -1))
        } else {
          // Changing vote (swing by 2)
          setVoteCount(voteCount + (voteType === 'up' ? 2 : -2))
        }

        setUserVote(voteType)
      }

      router.refresh()
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote('up')}
        disabled={isVoting}
        className={`p-2 rounded-md transition ${
          userVote === 'up'
            ? 'bg-green-100 text-green-600'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } disabled:opacity-50`}
        aria-label="Upvote"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <span
        className={`min-w-[2rem] text-center font-semibold ${
          voteCount > 0 ? 'text-green-600' : voteCount < 0 ? 'text-red-600' : 'text-gray-600'
        }`}
      >
        {voteCount}
      </span>

      <button
        onClick={() => handleVote('down')}
        disabled={isVoting}
        className={`p-2 rounded-md transition ${
          userVote === 'down'
            ? 'bg-red-100 text-red-600'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } disabled:opacity-50`}
        aria-label="Downvote"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  )
}
