import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/ProfileForm'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

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
              href={`/profile/${profile?.username}`}
              className="text-gray-700 hover:text-gray-900"
            >
              Profile
            </Link>
            <Link
              href="/bookmarks"
              className="text-gray-700 hover:text-gray-900"
            >
              Bookmarks
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your profile information
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Account Info */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Account Information
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="text-gray-900">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">User ID:</span>
                <span className="text-gray-900 font-mono text-xs">
                  {user.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Karma Points:</span>
                <span className="text-blue-600 font-semibold">
                  {profile?.karma_points || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="border-t pt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Profile Information
            </h2>
            <ProfileForm profile={profile} />
          </div>
        </div>
      </main>
    </div>
  )
}
