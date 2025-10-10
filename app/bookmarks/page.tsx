import { createClient } from '@/lib/supabase/server'
import { JobCard } from '@/components/JobCard'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function BookmarksPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch bookmarked jobs
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('job_posting_id, job_postings(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const jobs = bookmarks?.map((b) => b.job_postings).filter(Boolean) || []

  // Get vote counts and comment counts for each job
  const jobsWithCounts = await Promise.all(
    jobs.map(async (job: any) => {
      if (!job) return null

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
      }
    })
  )

  const validJobs = jobsWithCounts.filter(Boolean)

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
              className="text-gray-700 hover:text-gray-900"
            >
              Browse Jobs
            </Link>
            <Link
              href={`/profile/${user.email?.split('@')[0]}`}
              className="text-gray-700 hover:text-gray-900"
            >
              Profile
            </Link>
            <Link
              href="/submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Submit Job
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Bookmarks</h1>
          <p className="mt-2 text-gray-600">
            Jobs you&apos;ve bookmarked for later review
          </p>
        </div>

        {/* Bookmarked Jobs */}
        <div className="space-y-4">
          {validJobs && validJobs.length > 0 ? (
            validJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                voteCount={job.voteCount}
                commentCount={job.commentCount}
              />
            ))
          ) : (
            <div className="bg-white rounded-lg p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No bookmarks yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Start bookmarking jobs you&apos;re interested in to see them here.
              </p>
              <div className="mt-6">
                <Link
                  href="/jobs"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Browse Jobs
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
