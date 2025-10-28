'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Submission, SubmissionStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trophy, CheckCircle, X, MinusCircle } from 'lucide-react'

interface ModerationActionsProps {
  submission: Submission
  onStatusChange: (submissionId: string, newStatus: SubmissionStatus) => void
  onBanUser: (userId: string) => void
}

export default function ModerationActions({ submission, onStatusChange, onBanUser }: ModerationActionsProps) {
  const [updating, setUpdating] = useState(false)
  const supabase = createClient()

  const handleStatusUpdate = async (newStatus: SubmissionStatus) => {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ status: newStatus })
        .eq('id', submission.id)

      if (error) throw error

      onStatusChange(submission.id, newStatus)
      alert(`Submission ${newStatus.toLowerCase()}`)
    } catch (error) {
      console.error('Error updating submission:', error)
      alert('Failed to update submission')
    } finally {
      setUpdating(false)
    }
  }

  const handleBanUser = async () => {
    if (!submission.submitter_id) return

    const confirmed = window.confirm('Are you sure you want to ban this user?')
    if (!confirmed) return

    setUpdating(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: true })
        .eq('id', submission.submitter_id)

      if (error) throw error

      onBanUser(submission.submitter_id)
      alert('User banned')
    } catch (error) {
      console.error('Error banning user:', error)
      alert('Failed to ban user')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={() => handleStatusUpdate('APPROVED')}
        disabled={updating || submission.status === 'APPROVED'}
        className="bg-green-600 hover:bg-green-700 text-white"
        size="sm"
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Approve
      </Button>

      <Button
        onClick={() => handleStatusUpdate('DENIED')}
        disabled={updating || submission.status === 'DENIED'}
        className="bg-red-600 hover:bg-red-700 text-white"
        size="sm"
      >
        <X className="h-4 w-4 mr-2" />
        Deny
      </Button>

      <Button
        onClick={() => handleStatusUpdate('WINNER')}
        disabled={updating || submission.status === 'WINNER'}
        className="bg-yellow-600 hover:bg-yellow-700 text-white"
        size="sm"
      >
        <Trophy className="h-4 w-4 mr-2" />
        Mark Winner
      </Button>

      <Button
        onClick={handleBanUser}
        disabled={updating}
        variant="destructive"
        size="sm"
      >
        <MinusCircle className="h-4 w-4 mr-2" />
        Ban User
      </Button>

      {submission.status && (
        <Badge variant="secondary" className="ml-auto">
          Current: {submission.status}
        </Badge>
      )}
    </div>
  )
}

