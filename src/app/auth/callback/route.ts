import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // SECURITY: Validate redirect URL to prevent open redirect attacks
  const sanitizeRedirectUrl = (url: string): string => {
    // Only allow relative URLs starting with /
    if (url.startsWith('/') && !url.includes('//')) {
      // Additional check: ensure it's a valid path
      if (/^\/[a-zA-Z0-9\-_\/?=&]*$/.test(url)) {
        return url
      }
    }
    return '/'
  }

  const safeNext = sanitizeRedirectUrl(next)

  if (code) {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get user info and create/update profile
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if profile exists, create if not
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!existingProfile) {
          // Create new profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              twitch_id: user.user_metadata?.provider_id,
              username: user.user_metadata?.preferred_username || user.user_metadata?.name || 'Unknown',
              avatar_url: user.user_metadata?.avatar_url,
              role: 'VIEWER' // Default role
            })

          if (profileError) {
            console.error('Error creating profile:', profileError.message)
          }
        }
      }
      
      return NextResponse.redirect(`${origin}${safeNext}`)
    } else {
      // Error during authentication - log message only, not full error object
      console.error('Auth error:', error.message)
      return NextResponse.redirect(`${origin}/?error=Authentication failed`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/?error=Invalid authorization code`)
}

