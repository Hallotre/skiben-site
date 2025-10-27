'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { Profile } from '@/types'
import { Button, Avatar, Box, Chip, CircularProgress } from '@mui/material'

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

  const getRoleColor = (role: string): 'error' | 'secondary' | 'warning' | 'default' => {
    switch (role) {
      case 'ADMIN': return 'error'
      case 'STREAMER': return 'secondary'
      case 'MODERATOR': return 'warning'
      default: return 'default'
    }
  }

  if (loading) {
    return <CircularProgress size={24} />
  }

  if (user && profile) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {profile.avatar_url && (
          <Avatar 
            src={profile.avatar_url} 
            alt={profile.username}
            sx={{ width: 36, height: 36 }}
          />
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
            {profile.username}
          </Box>
          <Chip 
            label={profile.role} 
            size="small" 
            color={getRoleColor(profile.role)}
            sx={{ fontSize: '0.75rem', height: '20px' }}
          />
        </Box>
        <Button 
          onClick={handleSignOut} 
          variant="outlined" 
          size="small"
          sx={{ ml: 1 }}
        >
          Sign Out
        </Button>
      </Box>
    )
  }

  return (
    <Button 
      variant="contained"
      onClick={handleSignIn}
      sx={{
        backgroundColor: '#9146ff',
        '&:hover': { backgroundColor: '#772ce8' },
        boxShadow: '0 4px 14px 0 rgba(145, 70, 255, 0.2)'
      }}
    >
      Sign in with Twitch
    </Button>
  )
}

