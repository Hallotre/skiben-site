'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Contest } from '@/types'
import { Dialog, DialogTitle, DialogContent, TextField, Button, Box, Typography, Select, MenuItem, FormControl, InputLabel, Alert, IconButton, Stack } from '@mui/material'
import { Close } from '@mui/icons-material'

interface SubmissionModalProps {
  contest: Contest
  onClose: () => void
  onSubmitSuccess: () => void
}

export default function SubmissionModal({ contest, onClose, onSubmitSuccess }: SubmissionModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    source: 'YOUTUBE',
    link: '',
    startTimestamp: '',
    endTimestamp: '',
    comment: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to submit')
        return
      }

      // SECURITY: Use validated video extraction
      const { extractVideoId, validateVideoUrl } = await import('@/lib/video-utils')
      
      if (!validateVideoUrl(formData.link)) {
        setError('Invalid video URL. Please use a valid YouTube or TikTok URL.')
        return
      }

      const videoData = extractVideoId(formData.link)
      if (!videoData || !videoData.videoId) {
        setError('Could not extract video ID from URL')
        return
      }

      const videoId = videoData.videoId
      const platform = videoData.platform

      const { error: insertError } = await supabase
        .from('submissions')
        .insert({
          title: formData.title,
          platform: platform as any,
          video_url: formData.link,
          video_id: videoId,
          submitter_id: user.id,
          contest_id: contest.id,
          source: formData.source,
          start_timestamp: formData.startTimestamp,
          end_timestamp: formData.endTimestamp,
          submission_comment: formData.comment,
          metadata: {
            source: formData.source,
            start_timestamp: formData.startTimestamp,
            end_timestamp: formData.endTimestamp,
            comment: formData.comment
          }
        })

      if (insertError) {
        setError(insertError.message)
        return
      }

      onSubmitSuccess()
      onClose()
    } catch (err: any) {
      setError('An unexpected error occurred')
      console.error('Submission error:', err?.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog 
      open={true} 
      onClose={onClose} 
      maxWidth={false}
      PaperProps={{
        sx: {
          bgcolor: 'rgb(8, 8, 8)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: 2,
          maxWidth: '400px',
          width: '400px',
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1, pt: 2 }}>
        <Box>
          <Typography variant="h2" component="div" sx={{ fontWeight: 700, color: 'white', mb: 0.5, fontSize: '1.75rem' }}>
            SHIBEN
          </Typography>
          <Typography component="div" sx={{ color: 'white', fontSize: '0.75rem', mb: 0.5 }}>
            CONTEST ID: {contest.display_number || contest.id.substring(0, 8)}
          </Typography>
          <Typography component="div" sx={{ color: 'white', fontWeight: 700, fontSize: '0.875rem' }}>
            {contest.title}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ textAlign: 'center' }}>
        {/* SUBMISSION Heading */}
        <Typography 
          variant="h5" 
          component="div"
          sx={{ 
            color: 'white', 
            fontWeight: 700, 
            mb: 2,
            fontSize: '1.5rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          SUBMISSION
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              required
              fullWidth
              variant="outlined"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              autoFocus
              InputLabelProps={{
                sx: { color: 'white', fontWeight: 500, fontSize: '0.95rem' }
              }}
              InputProps={{
                sx: {
                  color: 'white',
                  bgcolor: 'rgb(18, 18, 18)',
                  borderRadius: 1,
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                }
              }}
            />

            <FormControl fullWidth required>
              <InputLabel sx={{ color: 'white', fontWeight: 500 }}>Source</InputLabel>
              <Select
                value={formData.source}
                label="Source *"
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                sx={{
                  color: 'white',
                  bgcolor: 'rgb(18, 18, 18)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                  '& .MuiSelect-icon': {
                    color: 'white',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: '#282828',
                    },
                  },
                }}
              >
                <MenuItem value="YOUTUBE" sx={{ color: 'white' }}>YouTube</MenuItem>
                <MenuItem value="TIKTOK" sx={{ color: 'white' }}>TikTok</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Link"
              required
              fullWidth
              variant="outlined"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
              InputLabelProps={{
                sx: { color: 'white', fontWeight: 500, fontSize: '0.95rem' }
              }}
              InputProps={{
                sx: {
                  color: 'white',
                  bgcolor: 'rgb(18, 18, 18)',
                  borderRadius: 1,
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'white',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                  },
                }
              }}
            />

            <TextField
              label="Start Timestamp"
              required
              fullWidth
              variant="filled"
              value={formData.startTimestamp}
              onChange={(e) => setFormData({ ...formData, startTimestamp: e.target.value })}
              placeholder="0:15"
              InputLabelProps={{
                sx: { color: 'white', fontWeight: 500, fontSize: '0.95rem' }
              }}
              InputProps={{
                sx: {
                  color: 'white',
                  bgcolor: 'rgb(18, 18, 18) !important',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'rgb(24, 24, 24) !important',
                  },
                  '&.Mui-focused': {
                    bgcolor: 'rgb(24, 24, 24) !important',
                  },
                }
              }}
              sx={{
                '& .MuiFilledInput-root': {
                  bgcolor: 'rgb(18, 18, 18) !important',
                  '&:hover': {
                    bgcolor: 'rgb(24, 24, 24) !important',
                  },
                  '&.Mui-focused': {
                    bgcolor: 'rgb(24, 24, 24) !important',
                  },
                }
              }}
            />

            <TextField
              label="End Timestamp"
              required
              fullWidth
              variant="filled"
              value={formData.endTimestamp}
              onChange={(e) => setFormData({ ...formData, endTimestamp: e.target.value })}
              placeholder="0:30"
              InputLabelProps={{
                sx: { color: 'white', fontWeight: 500, fontSize: '0.95rem' }
              }}
              InputProps={{
                sx: {
                  color: 'white',
                  bgcolor: 'rgb(18, 18, 18) !important',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'rgb(24, 24, 24) !important',
                  },
                  '&.Mui-focused': {
                    bgcolor: 'rgb(24, 24, 24) !important',
                  },
                }
              }}
              sx={{
                '& .MuiFilledInput-root': {
                  bgcolor: 'rgb(18, 18, 18) !important',
                  '&:hover': {
                    bgcolor: 'rgb(24, 24, 24) !important',
                  },
                  '&.Mui-focused': {
                    bgcolor: 'rgb(24, 24, 24) !important',
                  },
                }
              }}
            />

            <TextField
              label="Comment"
              fullWidth
              multiline
              rows={4}
              variant="filled"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              InputLabelProps={{
                sx: { color: 'white', fontWeight: 500, fontSize: '0.95rem' }
              }}
              InputProps={{
                sx: {
                  color: 'white',
                  bgcolor: 'rgb(18, 18, 18) !important',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'rgb(24, 24, 24) !important',
                  },
                  '&.Mui-focused': {
                    bgcolor: 'rgb(24, 24, 24) !important',
                  },
                }
              }}
              sx={{
                '& .MuiFilledInput-root': {
                  bgcolor: 'rgb(18, 18, 18) !important',
                  '&:hover': {
                    bgcolor: 'rgb(24, 24, 24) !important',
                  },
                  '&.Mui-focused': {
                    bgcolor: 'rgb(24, 24, 24) !important',
                  },
                }
              }}
            />

            {error && (
              <Box sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: 1, p: 2 }}>
                <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                  {error}
                </Typography>
              </Box>
            )}

            <Box sx={{ pt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  py: 1.5,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                  },
                  '&:disabled': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    color: 'rgba(255, 255, 255, 0.4)',
                  },
                }}
              >
                {loading ? 'SUBMITTING...' : 'SUBMIT'}
              </Button>
            </Box>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  )
}

