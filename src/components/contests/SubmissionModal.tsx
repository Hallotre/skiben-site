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
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth PaperProps={{
      sx: {
        backgroundImage: 'linear-gradient(to right, rgba(37, 99, 235, 0.05), rgba(6, 182, 212, 0.05))',
        background: 'rgba(26, 26, 46, 0.95)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: 1,
      }
    }}>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {contest.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Submission Form
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Title"
              required
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              autoFocus
            />

            <FormControl fullWidth required>
              <InputLabel>Platform</InputLabel>
              <Select
                value={formData.source}
                label="Platform"
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              >
                <MenuItem value="YOUTUBE">YouTube</MenuItem>
                <MenuItem value="TIKTOK">TikTok</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Video URL"
              required
              fullWidth
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
            />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Start Time"
                    required
                    fullWidth
                    value={formData.startTimestamp}
                    onChange={(e) => setFormData({ ...formData, startTimestamp: e.target.value })}
                    placeholder="0:15"
                  />
                  <TextField
                    label="End Time"
                    required
                    fullWidth
                    value={formData.endTimestamp}
                    onChange={(e) => setFormData({ ...formData, endTimestamp: e.target.value })}
                    placeholder="0:30"
                  />
                </Box>

            <TextField
              label="Comment (Optional)"
              fullWidth
              multiline
              rows={4}
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Add any additional context..."
            />

            {error && (
              <Alert severity="error">{error}</Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
              <Button
                variant="outlined"
                onClick={onClose}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth
              >
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            </Box>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  )
}

