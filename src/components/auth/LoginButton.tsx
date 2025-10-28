'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { Profile } from '@/types'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { User } from 'lucide-react'

interface LoginButtonProps {
  className?: string
}

export default function LoginButton({ className = '' }: LoginButtonProps) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profile)
      }
      
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setProfile(profile)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'twitch',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) console.error('Error signing in:', error)
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Error signing out:', error)
  }

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'ADMIN': return 'bg-red-600 text-white'
      case 'STREAMER': return 'bg-purple-600 text-white'
      case 'MODERATOR': return 'bg-orange-600 text-white'
      default: return 'bg-blue-600 text-white'
    }
  }

  if (loading) {
    return <Spinner size="sm" />
  }

  if (user && profile) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Avatar className="h-9 w-9">
          {profile.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={profile.username} />
          ) : (
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {profile.username}
          </span>
          <Badge className={getRoleColor(profile.role)}>
            {profile.role}
          </Badge>
        </div>
        <Button 
          onClick={handleSignOut} 
          variant="outline" 
          size="sm"
        >
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <Button 
      onClick={handleSignIn}
      className="bg-[#9146ff] hover:bg-[#772ce8] text-white shadow-md shadow-purple-500/20"
    >
      Sign in with Twitch
    </Button>
  )
}
