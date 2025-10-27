'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Submission, SubmissionStatus, ModerationAction } from '@/types'
import { Box, Chip, Button, Typography, Stack, Paper } from '@mui/material'
import { EmojiEvents, CheckCircle, Cancel, RemoveCircle } from '@mui/icons-material'

// ModerationActions component

interface ModerationActionsProps {
  submission: Submission
  onStatusChange: (submissionId: string, newStatus: SubmissionStatus) => void
  onBanUser: (userId: string) => void
}

export default function ModerationActions({ 
  submission, 
  onStatusChange, 
  onBanUser 
}: ModerationActionsProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleAction = async (action: ModerationAction) => {
    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let newStatus: SubmissionStatus | undefined
      
      switch (action) {
        case 'APPROVE':
          newStatus = 'APPROVED'
          break
        case 'DENY':
          newStatus = 'DENIED'
          break
        case 'MARK_WINNER':
          newStatus = 'WINNER'
          break
        case 'UNAPPROVE':
          newStatus = 'UNAPPROVED'
          break
        case 'REMOVE':
          // Delete submission
          const { error: deleteError } = await supabase
            .from('submissions')
            .delete()
            .eq('id', submission.id)
          
          if (deleteError) {
            console.error('Error deleting submission:', deleteError.message)
            return
          }
          
          // Log the action
          await supabase
            .from('moderation_logs')
            .insert({
              submission_id: submission.id,
              moderator_id: user.id,
              action: 'REMOVE',
              previous_status: submission.status,
              notes: 'Submission removed'
            })
          
          return
        case 'BAN_USER':
          // Ban the user
          const { error: banError } = await supabase
            .from('profiles')
            .update({ is_banned: true })
            .eq('id', submission.submitter_id)
          
          if (banError) {
            console.error('Error banning user:', banError.message)
            return
          }
          
          onBanUser(submission.submitter_id)
          return
      }

      if (newStatus) {
        // Update submission status
        const { error: updateError } = await supabase
          .from('submissions')
          .update({ status: newStatus })
          .eq('id', submission.id)
        
        if (updateError) {
          console.error('Error updating submission:', updateError.message)
          return
        }

        // Log the action
        await supabase
          .from('moderation_logs')
          .insert({
            submission_id: submission.id,
            moderator_id: user.id,
            action,
            previous_status: submission.status,
            new_status: newStatus
          })

        onStatusChange(submission.id, newStatus)
      }
    } catch (error: any) {
      console.error('Error performing moderation action:', error?.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: SubmissionStatus): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'APPROVED':
        return 'success'
      case 'DENIED':
        return 'error'
      case 'WINNER':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(30, 41, 59, 0.5)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">Status:</Typography>
            <Chip 
              label={submission.status} 
              color={getStatusColor(submission.status)}
              size="small"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            by {submission.submitter?.username || 'Unknown'}
          </Typography>
        </Box>
      </Paper>
      
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        {submission.status === 'UNAPPROVED' && (
          <>
            <Button
              onClick={() => handleAction('APPROVE')}
              disabled={loading}
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
            >
              Approve
            </Button>
            <Button
              onClick={() => handleAction('DENY')}
              disabled={loading}
              variant="contained"
              color="error"
              startIcon={<Cancel />}
            >
              Deny
            </Button>
          </>
        )}
        
        {submission.status === 'APPROVED' && (
          <>
            <Button
              onClick={() => handleAction('MARK_WINNER')}
              disabled={loading}
              variant="contained"
              color="warning"
              startIcon={<EmojiEvents />}
            >
              Mark Winner
            </Button>
            <Button
              onClick={() => handleAction('UNAPPROVE')}
              disabled={loading}
              variant="outlined"
            >
              Unapprove
            </Button>
          </>
        )}
        
        {submission.status === 'WINNER' && (
          <Button
            onClick={() => handleAction('APPROVE')}
            disabled={loading}
            variant="outlined"
          >
            Remove Winner Status
          </Button>
        )}
        
        <Button
          onClick={() => handleAction('REMOVE')}
          disabled={loading}
          variant="contained"
          color="error"
          startIcon={<RemoveCircle />}
        >
          Remove
        </Button>
        
        <Button
          onClick={() => handleAction('BAN_USER')}
          disabled={loading}
          variant="outlined"
          color="error"
        >
          Ban User
        </Button>
      </Stack>
    </Box>
  )
}
