import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

type JobCardProps = {
  job: {
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
  voteCount?: number
  commentCount?: number
}

export function JobCard({ job, voteCount = 0, commentCount = 0 }: JobCardProps) {
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
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Link href={`/jobs/${job.id}`} className="text-xl font-semibold text-gray-900 hover:text-blue-600">
              {job.title}
            </Link>
            {badgeText && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeColor}`}>
                {badgeText}
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-2">{job.company}</p>

          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
            {job.location && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </span>
            )}

            <span className="capitalize flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {job.job_type}
            </span>

            {job.category && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {job.category}
              </span>
            )}

            <span className="text-gray-400">
              {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Posted by */}
          {job.profiles && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              {job.profiles.avatar_url ? (
                <img
                  src={job.profiles.avatar_url}
                  alt={job.profiles.username}
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                  {job.profiles.username.charAt(0).toUpperCase()}
                </div>
              )}
              <span>
                Posted by{' '}
                <Link
                  href={`/profile/${job.profiles.username}`}
                  className="text-blue-600 hover:underline"
                >
                  {job.profiles.username}
                </Link>
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 ml-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1" title="Votes">
              {voteCount > 0 && (
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              )}
              {voteCount < 0 && (
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
              <span className={voteCount > 0 ? 'text-green-600 font-medium' : voteCount < 0 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                {voteCount > 0 ? '+' : ''}{voteCount}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{commentCount}</span>
            </div>
          </div>

          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View →
          </a>
        </div>
      </div>
    </div>
  )
}
