import { createClient } from '@/lib/supabase/server'
import { JobCard } from '@/components/JobCard'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  // Get the profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // Get current user to check if viewing own profile
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === profile.id

  // Get user's job postings
  const { data: jobPostings } = await supabase
    .from('job_postings')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  // Get vote counts and comment counts for each job
  const jobsWithCounts = await Promise.all(
    (jobPostings || []).map(async (job) => {
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

  // Get user's comments
  const { data: comments } = await supabase
    .from('comments')
    .select('*, job_postings(id, title)')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Calculate stats
  const totalJobs = jobPostings?.length || 0
  const totalComments = (await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)).count || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Real Job Postings
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/jobs" className="text-gray-700 hover:text-gray-900">
              Browse Jobs
            </Link>
            {isOwnProfile && (
              <>
                <Link
                  href="/bookmarks"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Bookmarks
                </Link>
                <Link
                  href="/settings"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Settings
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                  {profile.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {profile.username}
              </h1>
              {profile.bio && (
                <p className="mt-2 text-gray-600">{profile.bio}</p>
              )}
              <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
                <span>
                  Joined{' '}
                  {formatDistanceToNow(new Date(profile.created_at), {
                    addSuffix: true,
                  })}
                </span>
                <span className="font-semibold text-blue-600">
                  {profile.karma_points} karma points
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-3xl font-bold text-blue-600">{totalJobs}</div>
            <div className="text-sm text-gray-600 mt-1">Jobs Posted</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-3xl font-bold text-green-600">
              {totalComments}
            </div>
            <div className="text-sm text-gray-600 mt-1">Comments</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-3xl font-bold text-purple-600">
              {profile.karma_points}
            </div>
            <div className="text-sm text-gray-600 mt-1">Karma</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button className="border-b-2 border-blue-600 py-4 px-1 text-sm font-medium text-blue-600">
                Job Postings ({totalJobs})
              </button>
              <button className="border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Recent Comments ({totalComments})
              </button>
            </nav>
          </div>
        </div>

        {/* Job Postings */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            Posted Jobs ({totalJobs})
          </h2>
          {jobsWithCounts && jobsWithCounts.length > 0 ? (
            jobsWithCounts.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                voteCount={job.voteCount}
                commentCount={job.commentCount}
              />
            ))
          ) : (
            <div className="bg-white rounded-lg p-12 text-center">
              <p className="text-gray-500">No job postings yet.</p>
              {isOwnProfile && (
                <Link
                  href="/submit"
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit your first job
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Recent Comments */}
        {comments && comments.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              Recent Comments ({totalComments})
            </h2>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-2">
                    Commented on{' '}
                    <Link
                      href={`/jobs/${comment.job_postings?.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {comment.job_postings?.title}
                    </Link>{' '}
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                    })}
                  </div>
                  <p className="text-gray-900">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
