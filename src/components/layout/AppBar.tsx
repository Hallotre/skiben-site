'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Profile } from '@/types'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Shield } from 'lucide-react'

interface AppBarProps {
  hideOnModeration?: boolean
}

export default function AppBar({ hideOnModeration = false }: AppBarProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    const getUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          setProfile(profileData)
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error?.message || 'Unknown error')
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
  
  // Hide navbar on moderation pages (after all hooks are called)
  if (hideOnModeration && pathname?.startsWith('/moderation')) {
    return null
  }

  const isModerator = profile?.role === 'MODERATOR' || profile?.role === 'ADMIN'

  // Always render the same structure, just conditionally show user content
  return (
    <header 
      className="sticky top-0 z-50 w-full bg-slate-800/50 backdrop-blur-xl border-b border-blue-500/20"
    >
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-[15px]">
          <Link href="/" className="flex items-center gap-[15px]">
          <div className="flex items-center justify-center w-20 h-10">
            <img 
              src="https://cdn.7tv.app/emote/01K7PK7JEWS4Q9GQDFRJDEZE1N/4x.avif"
              alt="Skiben logo"
              className="w-full h-full object-contain image-rendering-crisp-edges"
            />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            SKIBEN
          </h1>
          </Link>

          {/* Separator and Social Links */}
          <div className="hidden md:flex items-center gap-4 ml-2">
            <span className="h-6 border-l border-white/20" />
            <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full text-blue-400 hover:text-white hover:bg-blue-500/10">
              <a
                href="https://www.youtube.com/@Skiben"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="flex items-center justify-center"
              >
                {/* YouTube filled logo */}
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M23.498 6.186a3.002 3.002 0 0 0-2.113-2.125C19.846 3.5 12 3.5 12 3.5s-7.846 0-9.385.561A3.002 3.002 0 0 0 .502 6.186C0 7.735 0 12 0 12s0 4.265.502 5.814a3.002 3.002 0 0 0 2.113 2.125C4.154 20.5 12 20.5 12 20.5s7.846 0 9.385-.561a3.002 3.002 0 0 0 2.113-2.125C24 16.265 24 12 24 12s0-4.265-.502-5.814ZM9.75 15.568V8.432L15.818 12 9.75 15.568Z" />
                </svg>
              </a>
            </Button>
            <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full text-blue-400 hover:text-white hover:bg-blue-500/10">
              <a
                href="https://www.tiktok.com/@realskiben"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex items-center justify-center"
              >
                {/* TikTok filled logo (single-color) */}
                <svg viewBox="0 0 48 48" className="h-5 w-5 fill-current" aria-hidden="true">
                  <path d="M41 17.4c-3.7 0-7.1-1.2-9.8-3.3v14.2c0 7.9-6.4 14.3-14.3 14.3S2.6 36.2 2.6 28.3 9 14 16.9 14c1.8 0 3.6.3 5.1 1v6.9c-1.4-1-3.1-1.6-5.1-1.6-4.8 0-8.7 3.9-8.7 8.7s3.9 8.7 8.7 8.7 8.7-3.9 8.7-8.7V2h6.7c.4 2.5 1.6 4.9 3.5 6.8 1.8 1.9 4.2 3.1 6.7 3.5V17.4z" />
                </svg>
              </a>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {mounted && !loading && isModerator && (
            <Button
              asChild
              size="sm"
              className="bg-blue-600/90 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 border border-blue-500/40 rounded-lg px-3"
            >
              <Link href="/moderation" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Kontrollpanel</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

