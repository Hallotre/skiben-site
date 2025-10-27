'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Submission, SubmissionStatus } from '@/types'
import { Typography, Box, Card, CardContent, Chip, CircularProgress, Grid, Paper, Avatar, Button } from '@mui/material'
import StatusFilter from './StatusFilter'
import ModerationActions from './ModerationActions'
import VideoPlayer from '@/components/video/VideoPlayer'

// SECURITY: Whitelist of allowed submission statuses
const ALLOWED_STATUSES: SubmissionStatus[] = ['UNAPPROVED', 'APPROVED', 'DENIED', 'WINNER']

function validateStatus(status: string | null): SubmissionStatus | 'ALL' {
  if (!status || !ALLOWED_STATUSES.includes(status as SubmissionStatus)) {
    return 'ALL'
  }
  return status as SubmissionStatus
}

interface ModerationDashboardProps {
  contestId?: string | null
}

export default function ModerationDashboard({ contestId = null }: ModerationDashboardProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStatus, setCurrentStatus] = useState<SubmissionStatus | 'ALL'>('ALL')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchSubmissions()
  }, [currentStatus])

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('submissions')
        .select(`
          *,
          submitter:profiles(*)
        `)
        .order('created_at', { ascending: false })

      // Filter by contest if specified
      if (contestId) {
        query = query.eq('contest_id', contestId)
      }

      // SECURITY: Validate status before using in query
      const validatedStatus = validateStatus(currentStatus)
      if (validatedStatus !== 'ALL' && ALLOWED_STATUSES.includes(validatedStatus as SubmissionStatus)) {
        query = query.eq('status', validatedStatus)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching submissions:', error)
        return
      }

      setSubmissions(data || [])
      
      // Select first submission if none selected
      if (!selectedSubmission && data && data.length > 0) {
        setSelectedSubmission(data[0])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (submissionId: string, newStatus: SubmissionStatus) => {
    setSubmissions(prev => 
      prev.map(sub => 
        sub.id === submissionId ? { ...sub, status: newStatus } : sub
      )
    )
    
    // Update selected submission if it's the one being changed
    if (selectedSubmission?.id === submissionId) {
      setSelectedSubmission(prev => prev ? { ...prev, status: newStatus } : null)
    }
    
    // Refresh the list to update counts
    fetchSubmissions()
  }

  const handleBanUser = (userId: string) => {
    // Remove all submissions from banned user
    setSubmissions(prev => prev.filter(sub => sub.submitter_id !== userId))
    
    // Clear selected submission if it was from banned user
    if (selectedSubmission?.submitter_id === userId) {
      setSelectedSubmission(null)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 3 }}>
          Loading submissions...
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: 'text.primary' }}>
          Video Submissions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and moderate submitted videos
        </Typography>
      </Box>

      <StatusFilter 
        currentStatus={currentStatus}
        onStatusChange={setCurrentStatus}
      />

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
        {/* Submissions List */}
        <Box sx={{ flex: { xs: '1', lg: '0 0 33%' }, minWidth: 0 }}>
          <Card elevation={0} sx={{ bgcolor: 'rgba(26, 26, 46, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary' }}>
                  Submissions
                </Typography>
                <Chip label={submissions.length} size="small" sx={{ bgcolor: 'primary.main', color: 'white' }} />
              </Box>
              
              <Box sx={{ maxHeight: '600px', overflowY: 'auto' }}>
                {submissions.map((submission) => (
                  <Paper
                    key={submission.id}
                    elevation={0}
                    onClick={() => setSelectedSubmission(submission)}
                    sx={{
                      p: 2,
                      mb: 2,
                      cursor: 'pointer',
                      borderRadius: 2,
                      backgroundColor: selectedSubmission?.id === submission.id 
                        ? 'primary.main' 
                        : 'rgba(26, 26, 46, 0.4)',
                      border: selectedSubmission?.id === submission.id ? '1px solid primary.main' : '1px solid rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        backgroundColor: selectedSubmission?.id === submission.id 
                          ? 'primary.dark' 
                          : 'rgba(26, 26, 46, 0.6)',
                        borderColor: 'primary.main',
                      },
                      transition: 'all 0.2s',
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {submission.thumbnail_url && (
                        <Avatar
                          src={submission.thumbnail_url}
                          variant="rounded"
                          sx={{ width: 60, height: 45 }}
                        />
                      )}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {submission.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {submission.platform} • {submission.submitter?.username}
                        </Typography>
                        <Chip
                          label={submission.status}
                          size="small"
                          sx={{
                            mt: 0.5,
                            height: 20,
                            fontSize: '0.65rem',
                            ...(submission.status === 'APPROVED' ? { bgcolor: 'success.main' } :
                                submission.status === 'DENIED' ? { bgcolor: 'error.main' } :
                                submission.status === 'WINNER' ? { bgcolor: 'warning.main' } :
                                { bgcolor: 'grey.700' })
                          }}
                        />
                      </Box>
                    </Box>
                  </Paper>
                ))}
                
                {submissions.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography color="text.secondary">No submissions found</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Selected Submission Details */}
        <Box sx={{ flex: { xs: '1', lg: '1' }, minWidth: 0 }}>
          {selectedSubmission ? (
            <Card elevation={0} sx={{ bgcolor: 'rgba(26, 26, 46, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <VideoPlayer
                  videoId={selectedSubmission.video_id}
                  platform={selectedSubmission.platform}
                  title={selectedSubmission.title}
                />
                
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 3, color: 'text.primary' }}>
                  {selectedSubmission.title}
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 4 }}>
                  <Box sx={{ flex: 1 }}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(26, 26, 46, 0.4)', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <Typography variant="caption" color="text.secondary">Platform</Typography>
                      <Typography variant="body1" fontWeight={600} sx={{ color: 'text.primary' }}>{selectedSubmission.platform}</Typography>
                    </Paper>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(26, 26, 46, 0.4)', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <Typography variant="caption" color="text.secondary">Submitted by</Typography>
                      <Typography variant="body1" fontWeight={600} sx={{ color: 'text.primary' }}>{selectedSubmission.submitter?.username || 'Unknown'}</Typography>
                    </Paper>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(26, 26, 46, 0.4)', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <Typography variant="caption" color="text.secondary">Date</Typography>
                      <Typography variant="body1" fontWeight={600} sx={{ color: 'text.primary' }}>{new Date(selectedSubmission.created_at).toLocaleDateString()}</Typography>
                    </Paper>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(26, 26, 46, 0.4)', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <Typography variant="caption" color="text.secondary">URL</Typography>
                      <Typography
                        component="a"
                        href={selectedSubmission.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body2"
                        sx={{ 
                          color: 'primary.main',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        Open Video →
                      </Typography>
                    </Paper>
                  </Box>
                </Box>

                <ModerationActions
                  submission={selectedSubmission}
                  onStatusChange={handleStatusChange}
                  onBanUser={handleBanUser}
                />
              </CardContent>
            </Card>
          ) : (
            <Card elevation={0} sx={{ textAlign: 'center', py: 12, bgcolor: 'rgba(26, 26, 46, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <CardContent>
                <Typography variant="h2" sx={{ mb: 2, opacity: 0.3 }}>🎯</Typography>
                <Typography variant="h6" color="text.secondary">Select a submission to review</Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  )
}
