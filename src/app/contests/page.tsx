'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Contest } from '@/types'
import { Container, Typography, Card, CardContent, Box, Chip, Button, CircularProgress, Stack } from '@mui/material'
import { Event, Description } from '@mui/icons-material'
import SubmissionModal from '@/components/contests/SubmissionModal'

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchContests()
  }, [])

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
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Active Contests
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Submit your videos to compete
        </Typography>
      </Box>
      
      {contests.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <Typography variant="h1" sx={{ mb: 2, opacity: 0.5 }}>🎯</Typography>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              No active contests
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Check back soon for new contest opportunities!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={3}>
          {contests.map((contest) => (
            <Card 
              key={contest.id} 
              sx={{ 
                '&:hover': {
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 3 }}>
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        label={contest.status}
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #ef4444 0%, #ec4899 100%)',
                          color: 'white',
                          fontWeight: 700,
                          boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)',
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                        <Event fontSize="small" />
                        <Typography variant="body2">
                          {new Date(contest.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </Typography>
                      </Box>
                    </Stack>

                    <Typography variant="h4" fontWeight={700} gutterBottom>
                      {contest.title}
                    </Typography>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      {contest.description}
                    </Typography>

                    <Chip
                      label={`${contest.submission_count} submissions`}
                      variant="outlined"
                      sx={{
                        borderColor: '#334155',
                        color: 'text.secondary',
                      }}
                    />
                  </Box>

                  {contest.status === 'ACTIVE' && (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => setSelectedContest(contest)}
                    >
                      Submit
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Submission Modal */}
      {selectedContest && (
        <SubmissionModal
          contest={selectedContest}
          onClose={() => setSelectedContest(null)}
          onSubmitSuccess={handleSubmitSuccess}
        />
      )}
    </Container>
  )
}

