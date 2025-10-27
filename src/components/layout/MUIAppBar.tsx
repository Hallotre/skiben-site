'use client'

import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Profile } from '@/types'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MUIAppBarProps {
  hideOnModeration?: boolean
}

export default function MUIAppBar({ hideOnModeration = false }: MUIAppBarProps) {
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

  const isModerator = profile?.role === 'MODERATOR' || profile?.role === 'STREAMER' || profile?.role === 'ADMIN'

  // Always render the same structure, just conditionally show user content
  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      suppressHydrationWarning
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
          {mounted && !loading && isModerator && (
            <Button 
              component={Link}
              href="/moderation"
              variant="outlined"
              size="small"
              sx={{ 
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                px: 2,
                '&:hover': { 
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
                transition: 'all 0.2s'
              }}
            >
              Dashboard
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

