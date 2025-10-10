import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { SearchFilters } from '@/components/SearchFilters'
import { JobsList } from '@/components/JobsList'

type SortOption = 'hot' | 'new' | 'top' | 'fake'

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: string
    search?: string
    category?: string
    location?: string
    job_type?: string
    min_score?: string
  }>
}) {
  const params = await searchParams
  const sort = (params.sort as SortOption) || 'hot'
  const search = params.search || ''
  const category = params.category || ''
  const location = params.location || ''
  const jobType = params.job_type || ''
  const minScore = params.min_score ? parseInt(params.min_score) : undefined

  const supabase = await createClient()

  // Build query based on sort option and filters
  let query = supabase
    .from('job_postings')
    .select('*, profiles!job_postings_user_id_fkey(username, avatar_url)')
    .eq('status', 'active')

  // Apply search filter (full-text search on title, company, description)
  if (search) {
    query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Apply category filter
  if (category) {
    query = query.eq('category', category)
  }

  // Apply location filter
  if (location) {
    query = query.ilike('location', `%${location}%`)
  }

  // Apply job type filter
  if (jobType) {
    query = query.eq('job_type', jobType)
  }

  // Apply minimum trust score filter
  if (minScore !== undefined) {
    query = query.gte('trust_score', minScore)
  }

  // Fetch all jobs first (we'll sort after calculating vote counts)
  const fetchLimit = sort === 'fake' ? 100 : 50
  const { data: jobs, error } = await query
    .order('created_at', { ascending: false })
    .limit(fetchLimit)

  if (error) {
    console.error('Error fetching jobs:', error)
  }

  // Fetch vote counts and comment counts for each job
  const jobsWithCounts = await Promise.all(
    (jobs || []).map(async (job) => {
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
        downvotes, // Keep downvotes for 'fake' sorting
      }
    })
  )

  // Apply sorting based on calculated values
  let finalJobs = [...jobsWithCounts]

  if (sort === 'hot') {
    // Hot: Combination of votes, comments, and recency
    finalJobs.sort((a, b) => {
      const now = Date.now()
      const aAge = (now - new Date(a.created_at).getTime()) / (1000 * 60 * 60) // hours
      const bAge = (now - new Date(b.created_at).getTime()) / (1000 * 60 * 60)

      // Reddit-style hot algorithm: (votes + comments) / (age + 2)^1.5
      const aHotScore = (a.voteCount + a.commentCount * 0.5) / Math.pow(aAge + 2, 1.5)
      const bHotScore = (b.voteCount + b.commentCount * 0.5) / Math.pow(bAge + 2, 1.5)

      return bHotScore - aHotScore
    })
  } else if (sort === 'new') {
    // New: Most recent first (already sorted by created_at)
    finalJobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } else if (sort === 'top') {
    // Top: Highest net votes (upvotes - downvotes)
    finalJobs.sort((a, b) => b.voteCount - a.voteCount)
  } else if (sort === 'fake') {
    // Fake: Most downvoted jobs (top 50%)
    const jobsWithDownvotes = finalJobs.filter(job => job.downvotes > 0)
    jobsWithDownvotes.sort((a, b) => b.downvotes - a.downvotes)
    const top50PercentCount = Math.ceil(jobsWithDownvotes.length * 0.5)
    finalJobs = jobsWithDownvotes.slice(0, Math.max(top50PercentCount, 10))
  }

  // Take only first 10 for initial display (except fake which already filtered)
  if (sort !== 'fake') {
    finalJobs = finalJobs.slice(0, 10)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Real Job Postings
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
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
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Log In
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <SearchFilters
          currentSort={sort}
          currentSearch={search}
          currentCategory={category}
          currentLocation={location}
          currentJobType={jobType}
          currentMinScore={minScore}
        />

        {/* Sort Options */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <div className="flex gap-2">
            <Link
              href={`/jobs?sort=hot${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}${location ? `&location=${location}` : ''}${jobType ? `&job_type=${jobType}` : ''}${minScore !== undefined ? `&min_score=${minScore}` : ''}`}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                sort === 'hot'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              🔥 Hot
            </Link>
            <Link
              href={`/jobs?sort=new${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}${location ? `&location=${location}` : ''}${jobType ? `&job_type=${jobType}` : ''}${minScore !== undefined ? `&min_score=${minScore}` : ''}`}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                sort === 'new'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              ✨ New
            </Link>
            <Link
              href={`/jobs?sort=top${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}${location ? `&location=${location}` : ''}${jobType ? `&job_type=${jobType}` : ''}${minScore !== undefined ? `&min_score=${minScore}` : ''}`}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                sort === 'top'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              ⭐ Top
            </Link>
            <Link
              href={`/jobs?sort=fake${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}${location ? `&location=${location}` : ''}${jobType ? `&job_type=${jobType}` : ''}${minScore !== undefined ? `&min_score=${minScore}` : ''}`}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                sort === 'fake'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              🚫 Fake
            </Link>
          </div>
        </div>

        {/* Job Listings */}
        <JobsList
          initialJobs={finalJobs || []}
          sortOption={sort}
          searchQuery={search}
          categoryFilter={category}
          locationFilter={location}
          jobTypeFilter={jobType}
          minScoreFilter={minScore}
        />
      </main>
    </div>
  )
}
