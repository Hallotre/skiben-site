'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Submission } from '@/types'
import { Box, Typography, Card, CardContent, Chip, CircularProgress, Paper } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

interface WinnersTabProps {
  contestId?: string | null
}

export default function WinnersTab({ contestId = null }: WinnersTabProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchWinners()
  }, [contestId])

  const fetchWinners = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('submissions')
        .select(`
          *,
          submitter:profiles(*)
        `)
        .eq('status', 'WINNER')
      
      // Filter by contest if specified
      if (contestId) {
        query = query.eq('contest_id', contestId)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching winners:', error)
        return
      }

      setSubmissions(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 3 }}>
          Loading winners...
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          fontWeight={800} 
          gutterBottom
          sx={{
            background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          🏆 Winner Submissions
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          All videos marked as winners - ready for sub alerts
        </Typography>
      </Box>

      {submissions.length === 0 ? (
        <Card elevation={0} sx={{ bgcolor: 'rgba(26, 26, 46, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>No winners yet</Typography>
          <Typography variant="body2" color="text.secondary">
            Winners will appear here once marked by the streamer
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {submissions.map((submission) => (
            <Card key={submission.id} elevation={0} sx={{ bgcolor: 'rgba(26, 26, 46, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
                  {/* Thumbnail */}
                  {submission.thumbnail_url && (
                    <Box sx={{ flexShrink: 0 }}>
                      <img
                        src={submission.thumbnail_url}
                        alt={submission.title}
                        style={{ width: '192px', height: '144px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    </Box>
                  )}

                  {/* Details */}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                          {submission.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary', mb: 2 }}>
                          <Chip label={submission.platform} size="small" sx={{ height: 24 }} />
                          <Typography variant="body2">By: {submission.submitter?.username || 'Unknown'}</Typography>
                          <Typography variant="body2">•</Typography>
                          <Typography variant="body2">{new Date(submission.created_at).toLocaleDateString()}</Typography>
                        </Box>
                      </Box>
                      <Chip 
                        label="WINNER" 
                        sx={{ bgcolor: 'warning.main', color: 'white', fontWeight: 700 }}
                      />
                    </Box>

                    {/* Video URL */}
                    <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Video URL
                        </Typography>
                        <Box 
                          onClick={() => copyToClipboard(submission.video_url, `url-${submission.id}`)}
                          sx={{ 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: 'primary.main',
                            '&:hover': { opacity: 0.8 }
                          }}
                        >
                          {copiedId === `url-${submission.id}` ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {copiedId === `url-${submission.id}` ? 'Copied!' : 'Copy'}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary', wordBreak: 'break-all' }}>
                        {submission.video_url}
                      </Typography>
                    </Paper>

                    {/* Video ID */}
                    <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Video ID (for embedding)
                        </Typography>
                        <Box 
                          onClick={() => copyToClipboard(submission.video_id, `id-${submission.id}`)}
                          sx={{ 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: 'primary.main',
                            '&:hover': { opacity: 0.8 }
                          }}
                        >
                          {copiedId === `id-${submission.id}` ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {copiedId === `id-${submission.id}` ? 'Copied!' : 'Copy'}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary', wordBreak: 'break-all' }}>
                        {submission.video_id}
                      </Typography>
                    </Paper>

                    {/* Embed Link */}
                    <Paper sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid', borderColor: 'divider' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Embed Link (for sub alert triggers)
                        </Typography>
                        <Box 
                          onClick={() => copyToClipboard(
                            submission.platform === 'YOUTUBE'
                              ? `https://www.youtube.com/watch?v=${submission.video_id}`
                              : `https://www.tiktok.com/@video/video/${submission.video_id}`,
                            `embed-${submission.id}`
                          )}
                          sx={{ 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: 'primary.main',
                            '&:hover': { opacity: 0.8 }
                          }}
                        >
                          {copiedId === `embed-${submission.id}` ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {copiedId === `embed-${submission.id}` ? 'Copied!' : 'Copy'}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary', wordBreak: 'break-all' }}>
                        {submission.platform === 'YOUTUBE'
                          ? `https://www.youtube.com/watch?v=${submission.video_id}`
                          : `https://www.tiktok.com/@video/video/${submission.video_id}`}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  )
}

