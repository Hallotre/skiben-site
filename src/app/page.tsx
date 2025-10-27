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
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching contests:', error)
        setContests([])
      } else {
        setContests(data || [])
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
                borderRadius: 1,
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
            color: 'white'
          }}>
            <CardContent>
              <Typography variant="h1" sx={{ mb: 2, opacity: 0.5, fontSize: '4rem' }}>🎯</Typography>
              <Typography variant="h5" fontWeight={600} gutterBottom color="white">
                No active contests
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
                bgcolor: 'rgba(26, 26, 46, 0.6)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(26, 26, 46, 0.8)',
                  borderColor: 'rgba(59, 130, 246, 0.4)',
                  boxShadow: '0 20px 25px -5px rgba(37, 99, 235, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s',
              }}
            >
              <CardContent>
                {/* Status and Date Row */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label="Active"
                    color="success"
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  />
                  <Chip
                    icon={<Event fontSize="small" />}
                    label={new Date(contest.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: '#94a3b8',
                      color: '#94a3b8',
                      '& .MuiChip-icon': {
                        color: '#94a3b8'
                      }
                    }}
                  />
                </Box>

                {/* Contest Type */}
                <Chip
                  label="Alert Contest"
                  size="small"
                  sx={{
                    bgcolor: '#3b82f6',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    mb: 2
                  }}
                />

                {/* Title */}
                <Typography 
                  variant="h5"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    mb: 3,
                    fontSize: '1.25rem',
                    lineHeight: 1.3
                  }}
                >
                  {contest.title}
                </Typography>

                {/* Description */}
                <Typography 
                  variant="body2"
                  sx={{
                    color: '#94a3b8',
                    mb: 3,
                    lineHeight: 1.6
                  }}
                >
                  {contest.description}
                </Typography>

                {/* Submissions Count */}
                <Chip
                  icon={<Event fontSize="small" />}
                  label={`${contest.submission_count} Submissions`}
                  variant="outlined"
                  sx={{
                    borderColor: '#3b82f6',
                    color: '#3b82f6',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    '& .MuiChip-icon': {
                      color: '#3b82f6'
                    }
                  }}
                />
              </CardContent>
              
              {/* Card Actions */}
              <CardActions sx={{ justifyContent: 'flex-end', px: 3 }}>
                {contest.status === 'ACTIVE' && (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => setSelectedContest(contest)}
                      startIcon={<TwitchIcon />}
                    sx={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1d4ed8 0%, #0891b2 100%)',
                        boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)',
                      },
                    }}
                  >
                    Submit
                  </Button>
                )}
              </CardActions>
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
