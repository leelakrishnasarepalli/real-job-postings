import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { MobileNav } from './MobileNav'

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
            Real Job Postings
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/jobs"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Browse Jobs
              </Link>
              <Link
                href="/submit"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Submit Job
              </Link>
              <Link
                href="/bookmarks"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Bookmarks
              </Link>
              <Link
                href="/settings"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Settings
              </Link>
              <Link
                href="/profile"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Profile
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/jobs"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Browse Jobs
              </Link>
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <MobileNav user={user} />
      </nav>
    </header>
  )
}
