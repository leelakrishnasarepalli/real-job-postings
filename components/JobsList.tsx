'use client'

import { useState } from 'react'
import { JobCard } from './JobCard'
import { createClient } from '@/lib/supabase/client'

type Job = {
  id: string
  title: string
  company: string
  location: string | null
  job_type: 'remote' | 'hybrid' | 'onsite'
  trust_score: number
  created_at: string
  category: string | null
  url: string
  profiles?: {
    username: string
    avatar_url: string | null
  }
}

type JobWithCounts = Job & {
  voteCount: number
  commentCount: number
}

interface JobsListProps {
  initialJobs: JobWithCounts[]
  sortOption: 'hot' | 'new' | 'top' | 'fake'
  searchQuery: string
  categoryFilter: string
  locationFilter: string
  jobTypeFilter: string
  minScoreFilter?: number
}

const JOBS_PER_PAGE = 10

export function JobsList({
  initialJobs,
  sortOption,
  searchQuery,
  categoryFilter,
  locationFilter,
  jobTypeFilter,
  minScoreFilter,
}: JobsListProps) {
  const [jobs, setJobs] = useState<JobWithCounts[]>(initialJobs)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialJobs.length === JOBS_PER_PAGE)
  const supabase = createClient()

  const loadMore = async () => {
    if (loading || !hasMore) return

    setLoading(true)

    try {
      // Build query based on sort option and filters
      let query = supabase
        .from('job_postings')
        .select('*, profiles!job_postings_user_id_fkey(username, avatar_url)')
        .eq('status', 'active')

      // Apply search filter
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      }

      // Apply category filter
      if (categoryFilter) {
        query = query.eq('category', categoryFilter)
      }

      // Apply location filter
      if (locationFilter) {
        query = query.ilike('location', `%${locationFilter}%`)
      }

      // Apply job type filter
      if (jobTypeFilter) {
        query = query.eq('job_type', jobTypeFilter)
      }

      // Apply minimum trust score filter
      if (minScoreFilter !== undefined) {
        query = query.gte('trust_score', minScoreFilter)
      }

      // Fetch more jobs (sorted by created_at for now)
      const { data: newJobs, error } = await query
        .order('created_at', { ascending: false })
        .range(jobs.length, jobs.length + JOBS_PER_PAGE - 1)

      if (error) throw error

      // Fetch vote counts and comment counts for new jobs
      const jobsWithCounts = await Promise.all(
        (newJobs || []).map(async (job) => {
          const { data: votes } = await supabase
            .from('votes')
            .select('vote_type')
            .eq('job_posting_id', job.id)

          const { count: commentCount } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('job_posting_id', job.id)

          const upvotes = votes?.filter((v) => v.vote_type === 'up').length || 0
          const downvotes = votes?.filter((v) => v.vote_type === 'down').length || 0
          const voteCount = upvotes - downvotes

          return {
            ...job,
            voteCount,
            commentCount: commentCount || 0,
            downvotes,
          }
        })
      )

      // Apply client-side sorting to new jobs
      let sortedNewJobs = [...jobsWithCounts]

      if (sortOption === 'hot') {
        sortedNewJobs.sort((a, b) => {
          const now = Date.now()
          const aAge = (now - new Date(a.created_at).getTime()) / (1000 * 60 * 60)
          const bAge = (now - new Date(b.created_at).getTime()) / (1000 * 60 * 60)
          const aHotScore = (a.voteCount + a.commentCount * 0.5) / Math.pow(aAge + 2, 1.5)
          const bHotScore = (b.voteCount + b.commentCount * 0.5) / Math.pow(bAge + 2, 1.5)
          return bHotScore - aHotScore
        })
      } else if (sortOption === 'top') {
        sortedNewJobs.sort((a, b) => b.voteCount - a.voteCount)
      } else if (sortOption === 'fake') {
        sortedNewJobs = sortedNewJobs.filter(job => job.downvotes > 0)
        sortedNewJobs.sort((a, b) => b.downvotes - a.downvotes)
      }
      // 'new' is already sorted by created_at

      setJobs([...jobs, ...sortedNewJobs])
      setHasMore(sortedNewJobs.length === JOBS_PER_PAGE)
    } catch (error) {
      console.error('Error loading more jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg p-12 text-center">
        <p className="text-gray-500 mb-4">No job postings found.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-4">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            voteCount={job.voteCount}
            commentCount={job.commentCount}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className={`px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Loading...' : 'Load More Jobs'}
          </button>
        </div>
      )}

      {!hasMore && jobs.length > 0 && (
        <div className="mt-8 text-center text-gray-500 text-sm">
          You&apos;ve reached the end of the list
        </div>
      )}
    </div>
  )
}
