'use client'

import { AppBar, Toolbar, Typography, Box, Button, Avatar, Chip } from '@mui/material'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Profile } from '@/types'
import Link from 'next/link'
import SeventvEmote from '@/components/emoji/SeventvEmote'

export default function MUIAppBar() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    const getUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
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

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'error'
      case 'STREAMER': return 'secondary'
      case 'MODERATOR': return 'warning'
      default: return 'default'
    }
  }

  const isModerator = profile?.role === 'MODERATOR' || profile?.role === 'STREAMER' || profile?.role === 'ADMIN'

  // Prevent hydration mismatch by not rendering user-specific content until mounted
  if (!mounted) {
    return (
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          backgroundColor: 'rgba(26, 26, 46, 0.6)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 15 }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 40
            }}>
              <img 
                src="https://cdn.7tv.app/emote/01K7PK7JEWS4Q9GQDFRJDEZE1N/4x.avif"
                alt="Skiben logo"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  imageRendering: 'crisp-edges'
                }}
              />
            </Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              SKIBEN
            </Typography>
          </Link>
          <Box sx={{ flexGrow: 1 }} />
        </Toolbar>
      </AppBar>
    )
  }

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        backgroundColor: 'rgba(26, 26, 46, 0.6)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 15 }}>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 40
          }}>
            <img 
              src="https://cdn.7tv.app/emote/01K7PK7JEWS4Q9GQDFRJDEZE1N/4x.avif"
              alt="Skiben logo"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                imageRendering: 'crisp-edges'
              }}
            />
          </Box>
          <Typography variant="h6" sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            SKIBEN
          </Typography>
        </Link>

        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {!loading && isModerator && (
            <Button 
              component={Link}
              href="/moderation"
              variant="contained"
              color="secondary"
              size="small"
              sx={{ 
                '&:hover': { 
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s'
              }}
            >
              Dashboard
            </Button>
          )}
          
          {user && profile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {profile.avatar_url && (
                <Avatar 
                  src={profile.avatar_url} 
                  alt={profile.username}
                  sx={{ width: 32, height: 32 }}
                />
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  {profile.username}
                </Typography>
                <Chip 
                  label={profile.role} 
                  size="small" 
                  color={getRoleColor(profile.role)}
                  sx={{ height: 20, fontSize: '0.7rem' }}
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
          ) : null}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

