import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Sign out the user
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Signout error:', error)
    return NextResponse.redirect(new URL('/?error=signout-failed', request.url))
  }

  // Revalidate the home page to clear cached user data
  revalidatePath('/', 'layout')

  // Redirect to home page after successful signout
  return NextResponse.redirect(new URL('/', request.url))
}

// Handle GET requests (in case someone navigates directly to /auth/signout)
export async function GET(request: Request) {
  const supabase = await createClient()

  // Sign out the user
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Signout error:', error)
    return NextResponse.redirect(new URL('/?error=signout-failed', request.url))
  }

  // Revalidate the home page to clear cached user data
  revalidatePath('/', 'layout')

  // Redirect to home page after successful signout
  return NextResponse.redirect(new URL('/', request.url))
}
