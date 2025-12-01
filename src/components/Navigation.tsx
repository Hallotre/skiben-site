'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Profile } from '@/types'
import LoginButton from '@/components/auth/LoginButton'

export default function Navigation() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          setProfile(profile)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    getUserProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUserProfile()
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const isModerator = profile?.role === 'MODERATOR' || profile?.role === 'STREAMER' || profile?.role === 'ADMIN'

  return (
    <header className="border-b border-slate-800 bg-slate-800/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <span className="text-2xl">🏆</span>
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-bold gradient-text">Skiben</span>
          </a>

          {/* Navigation */}
          <nav className="flex items-center space-x-8">
            {!loading && isModerator && (
              <a
                href="/moderation"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600/90 px-3 py-1.5 text-white shadow-lg shadow-blue-500/20 ring-1 ring-inset ring-blue-500/40 hover:bg-blue-500 transition-colors"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                <span className="font-medium">Dashboard</span>
              </a>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center">
            <LoginButton />
          </div>
        </div>
      </div>
    </header>
  )
}

