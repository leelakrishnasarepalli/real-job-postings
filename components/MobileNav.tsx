'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Home, Briefcase, Bookmark, Settings, User, LogIn, PlusCircle } from 'lucide-react'

interface MobileNavProps {
  user: any
}

export function MobileNav({ user }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-64 bg-white shadow-lg z-50 lg:hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {user ? (
                <>
                  <MobileNavLink href="/" icon={<Home />} onClick={() => setIsOpen(false)}>
                    Home
                  </MobileNavLink>
                  <MobileNavLink href="/jobs" icon={<Briefcase />} onClick={() => setIsOpen(false)}>
                    Browse Jobs
                  </MobileNavLink>
                  <MobileNavLink href="/submit" icon={<PlusCircle />} onClick={() => setIsOpen(false)}>
                    Submit Job
                  </MobileNavLink>
                  <MobileNavLink href="/bookmarks" icon={<Bookmark />} onClick={() => setIsOpen(false)}>
                    Bookmarks
                  </MobileNavLink>
                  <MobileNavLink href="/settings" icon={<Settings />} onClick={() => setIsOpen(false)}>
                    Settings
                  </MobileNavLink>
                  <MobileNavLink href="/profile" icon={<User />} onClick={() => setIsOpen(false)}>
                    Profile
                  </MobileNavLink>
                  <form action="/auth/signout" method="post" className="mt-4">
                    <button
                      type="submit"
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <LogIn className="w-5 h-5" />
                      Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <MobileNavLink href="/" icon={<Home />} onClick={() => setIsOpen(false)}>
                    Home
                  </MobileNavLink>
                  <MobileNavLink href="/jobs" icon={<Briefcase />} onClick={() => setIsOpen(false)}>
                    Browse Jobs
                  </MobileNavLink>
                  <MobileNavLink href="/login" icon={<LogIn />} onClick={() => setIsOpen(false)}>
                    Sign In
                  </MobileNavLink>
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </>
  )
}

function MobileNavLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
    >
      <span className="w-5 h-5">{icon}</span>
      {children}
    </Link>
  )
}
