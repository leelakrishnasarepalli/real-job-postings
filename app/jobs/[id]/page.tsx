import { createClient } from '@/lib/supabase/server'
import { VoteButtons } from '@/components/VoteButtons'
import { CommentSection } from '@/components/CommentSection'
import { BookmarkButton } from '@/components/BookmarkButton'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch job posting
  const { data: job, error } = await supabase
    .from('job_postings')
    .select('*, profiles!job_postings_user_id_fkey(username, avatar_url)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching job:', error)
    notFound()
  }

  if (!job) {
    console.error('Job not found:', id)
    notFound()
  }

  // Fetch vote counts
  const { data: votes } = await supabase
    .from('votes')
    .select('vote_type')
    .eq('job_posting_id', id)

  const upvotes = votes?.filter((v) => v.vote_type === 'up').length || 0
  const downvotes = votes?.filter((v) => v.vote_type === 'down').length || 0
  const voteCount = upvotes - downvotes

  // Fetch comments
  const { data: comments } = await supabase
    .from('comments')
    .select('*, profiles!comments_user_id_fkey(username, avatar_url)')
    .eq('job_posting_id', id)
    .order('created_at', { ascending: false })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const getBadgeColor = (score: number) => {
    if (score >= 20) return 'bg-green-100 text-green-800'
    if (score >= 10) return 'bg-blue-100 text-blue-800'
    if (score >= 5) return 'bg-gray-100 text-gray-800'
    if (score < 0) return 'bg-red-100 text-red-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getBadgeText = (score: number) => {
    // Priority: Community badges > Time-based labels
    if (score >= 20) return 'Community Verified'
    if (score < -5) return 'Suspicious'

    // Time-based labels
    const age = new Date().getTime() - new Date(job.created_at).getTime()
    const hoursSinceCreation = age / (1000 * 60 * 60)
    const daysSinceCreation = hoursSinceCreation / 24

    if (hoursSinceCreation <= 4) return 'NEW'
    if (hoursSinceCreation <= 24) return 'TODAY'
    if (daysSinceCreation <= 2) return 'YESTERDAY'
    if (daysSinceCreation <= 7) return 'THIS WEEK'

    return null
  }

  const badgeText = getBadgeText(job.trust_score)
  const badgeColor = getBadgeColor(job.trust_score)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Real Job Postings
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/jobs"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Jobs
            </Link>
            {user && (
              <>
                <Link
                  href="/bookmarks"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Bookmarks
                </Link>
                <Link
                  href="/settings"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Settings
                </Link>
                <Link
                  href="/submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Submit Job
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          {/* Job Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                {badgeText && (
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${badgeColor}`}>
                    {badgeText}
                  </span>
                )}
              </div>

              <h2 className="text-xl text-gray-700 mb-4">{job.company}</h2>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {job.location && (
                  <span className="flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}
                  </span>
                )}

                <span className="capitalize flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {job.job_type}
                </span>

                {job.category && (
                  <span className="flex items-center gap-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {job.category}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <VoteButtons jobId={id} initialVoteCount={voteCount} userId={user?.id || null} />
              <BookmarkButton jobId={id} userId={user?.id} />
            </div>
          </div>

          {/* Description */}
          {job.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t pt-6 flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center gap-2">
              {job.profiles?.avatar_url ? (
                <img
                  src={job.profiles.avatar_url}
                  alt={job.profiles.username || 'User'}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm text-gray-600">
                  {(job.profiles?.username || 'A').charAt(0).toUpperCase()}
                </div>
              )}
              <span>Posted by</span>
              <Link
                href={`/profile/${job.profiles?.username}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {job.profiles?.username || 'Anonymous'}
              </Link>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
            </div>

            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Apply on Company Site →
            </a>
          </div>
        </div>

        {/* Comments Section */}
        <CommentSection
          jobPostingId={id}
          initialComments={comments || []}
          currentUserId={user?.id || null}
        />
      </main>
    </div>
  )
}
