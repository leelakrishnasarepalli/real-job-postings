import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">Real Job Postings</h1>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/jobs"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Browse Jobs
                </Link>
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
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="px-4 py-2 text-gray-700 hover:text-gray-900 transition"
                  >
                    Sign Out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Find Real Job Opportunities
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Community-verified job postings. Vote and comment to help identify legitimate opportunities.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-12">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Jobs</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Verified Jobs</dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">0</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
              <dd className="mt-1 text-3xl font-semibold text-blue-600">0</dd>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Ready to get started?
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                {user
                  ? 'Browse verified job postings or share opportunities you\'ve found.'
                  : 'Sign up to start sharing and discovering verified job opportunities.'}
              </p>
            </div>
            <div className="mt-5">
              {user ? (
                <Link
                  href="/jobs"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Browse Jobs
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign Up Now
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-blue-600 text-3xl mb-4">1</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Share Jobs</h4>
              <p className="text-gray-600">
                Found a job posting? Share the link with the community.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-blue-600 text-3xl mb-4">2</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Community Votes</h4>
              <p className="text-gray-600">
                Users upvote legitimate jobs and downvote suspicious postings.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-blue-600 text-3xl mb-4">3</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Find Real Jobs</h4>
              <p className="text-gray-600">
                Browse verified opportunities with confidence through trust scores.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
