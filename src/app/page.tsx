'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Contest } from '@/types'
import { Box, Card, CardContent, Typography, Button, CircularProgress, Chip, CardActions } from '@mui/material'
import { Event } from '@mui/icons-material'
import SubmissionModal from '@/components/contests/SubmissionModal'
import SeventvEmote from '@/components/emoji/SeventvEmote'

const TwitchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path 
      d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm16.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h15.714Z"
      fill="white"
      stroke="white"
      strokeWidth="1"
    />
  </svg>
)

const supabase = createClient()

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchContests()
    getUser()
  }, [])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }

  const handleConnect = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'twitch',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) console.error('Error signing in:', error)
  }

  const fetchContests = async () => {
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching contests:', error)
        setContests([])
      } else {
        // Sort: active contests first, then by most recent
        const sortedData = (data || []).sort((a, b) => {
          if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1
          if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        setContests(sortedData)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitSuccess = () => {
    fetchContests()
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 3 }}>
          Loading contests...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: '1100px', mx: 'auto', px: 10, py: 6 }}>
      {/* Header Section */}
      <Card sx={{ 
        bgcolor: 'rgba(26, 26, 46, 0.6)', 
        border: '1px solid rgba(59, 130, 246, 0.2)',
        textAlign: 'center',
        mb: 6,
        borderRadius: 2,
      }}>
        <CardContent sx={{ px: 4 }}>
          {/* Avatar */}
          <Box sx={{ display: 'inline-block', mb: 0 }}>
            <img 
              src="https://cdn.7tv.app/emote/01K2FVET0YSST6DY9519CP8YX6/4x.avif"
              alt="Skiben logo"
              style={{ 
                width: '150px',
                height: '150px',
                objectFit: 'contain',
                imageRendering: 'crisp-edges'
              }}
            />
          </Box>

          {/* Title */}
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              fontSize: { xs: '1.5rem', md: '2rem' }
            }}
          >
            SKIBEN Contests
          </Typography>

          {/* Connect Button */}
          {!user ? (
            <Button
              variant="contained"
              size="small"
              startIcon={<TwitchIcon />}
              onClick={handleConnect}
              sx={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                color: 'white',
                px: 2.5,
                py: 1,
                fontSize: '0.875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderRadius: 2,
                boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #0891b2 100%)',
                  boxShadow: '0 20px 25px -5px rgba(37, 99, 235, 0.4)',
                },
              }}
            >
              Connect
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {/* Contests List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {contests.length === 0 ? (
          <Card sx={{ 
            bgcolor: 'rgba(26, 26, 46, 0.6)', 
            border: '1px solid rgba(59, 130, 246, 0.2)',
            textAlign: 'center', 
            py: 8,
            color: 'white',
            borderRadius: 2,
          }}>
            <CardContent>
              <Typography variant="h1" sx={{ mb: 2, opacity: 0.5, fontSize: '4rem' }}>🎯</Typography>
              <Typography variant="h5" fontWeight={600} gutterBottom color="white">
                No contests found
              </Typography>
              <Typography variant="body1" sx={{ color: '#cccccc' }}>
                Check back soon for new contest opportunities!
              </Typography>
            </CardContent>
          </Card>
        ) : (
          contests.map((contest) => (
            <Card 
              key={contest.id} 
              sx={{ 
                bgcolor: contest.status === 'ACTIVE' ? 'rgba(26, 26, 46, 0.6)' : 'rgba(26, 26, 46, 0.3)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: 'white',
                borderRadius: 2,
                overflow: 'hidden',
                opacity: contest.status === 'ACTIVE' ? 1 : 0.6,
                '&:hover': {
                  bgcolor: contest.status === 'ACTIVE' ? 'rgba(26, 26, 46, 0.8)' : 'rgba(26, 26, 46, 0.4)',
                  borderColor: 'rgba(59, 130, 246, 0.4)',
                  transform: contest.status === 'ACTIVE' ? 'translateY(-2px)' : 'none',
                  boxShadow: contest.status === 'ACTIVE' ? '0 8px 16px rgba(0, 0, 0, 0.3)' : 'none',
                },
                transition: 'all 0.2s',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 3, alignItems: 'center', gap: 3 }}>
                {/* Left side - Text content */}
                <Box sx={{ flex: 1 }}>
                  {/* Status and Date */}
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="body2" sx={{ color: '#b4b4b4', fontSize: '0.75rem' }}>
                      Status: <Typography component="span" sx={{ 
                        color: contest.status === 'ACTIVE' ? '#ef4444' : '#64748b', 
                        fontWeight: 700, 
                        fontSize: '0.75rem' 
                      }}>
                        {contest.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </Typography>
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#b4b4b4', fontSize: '0.75rem', mt: 0.5 }}>
                      {new Date(contest.created_at).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Typography>
                  </Box>

                  {/* Alert Contest badge */}
                  <Box sx={{ mb: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'primary.main',
                        fontWeight: 700,
                        fontSize: '1rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}
                    >
                      ALERT CONTEST
                    </Typography>
                  </Box>

                  {/* Main title */}
                  <Typography 
                    variant="h6"
                    sx={{
                      color: 'white',
                      fontWeight: 700,
                      mb: 1.5,
                      fontSize: '1.5rem',
                      lineHeight: 1.2,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {contest.title}
                  </Typography>

                  {/* Submissions count */}
                  <Typography 
                    variant="body2"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 700,
                      fontSize: '1rem',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}
                  >
                    {contest.submission_count} SUBMISSIONS
                  </Typography>
                </Box>

                {/* Right side - Submit button */}
                {contest.status === 'ACTIVE' && (
                  <Box sx={{ alignSelf: 'center' }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setSelectedContest(contest)}
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        px: 2,
                        py: 1,
                        minWidth: 80,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontSize: '0.75rem',
                        borderRadius: 2,
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                        },
                      }}
                    >
                      SUBMIT
                    </Button>
                  </Box>
                )}
              </Box>
            </Card>
          ))
        )}
      </Box>

      {/* Submission Modal */}
      {selectedContest && (
        <SubmissionModal
          contest={selectedContest}
          onClose={() => setSelectedContest(null)}
          onSubmitSuccess={handleSubmitSuccess}
        />
      )}
    </Box>
  )
}
