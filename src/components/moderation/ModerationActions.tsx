'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Submission, SubmissionStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trophy, CheckCircle, X, MinusCircle, Shield, Trash2 } from 'lucide-react'

interface ModerationActionsProps {
  submission: Submission
  onStatusChange: (submissionId: string, newStatus: SubmissionStatus) => void
  onBanUser: (userId: string) => void
  onDeleteSubmission: (submissionId: string) => void
}

export default function ModerationActions({ submission, onStatusChange, onBanUser, onDeleteSubmission }: ModerationActionsProps) {
  const [updating, setUpdating] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setCurrentUser(profile)
      }
    }
    getUser()
  }, [])

  const handleStatusUpdate = async (newStatus: SubmissionStatus) => {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ status: newStatus })
        .eq('id', submission.id)

      if (error) throw error

      onStatusChange(submission.id, newStatus)
    } catch (error) {
      console.error('Error updating submission:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleBanUser = async () => {
    if (!submission.submitter_id) return

    const confirmed = window.confirm('Er du sikker på at du vil utestenge denne brukeren?')
    if (!confirmed) return

    setUpdating(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: true })
        .eq('id', submission.submitter_id)

      if (error) throw error

      onBanUser(submission.submitter_id)
    } catch (error) {
      console.error('Error banning user:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteSubmission = async () => {
    const confirmed = window.confirm('Er du sikker på at du vil slette denne innsendingen? Dette kan ikke angres.')
    if (!confirmed) return

    setUpdating(true)
    try {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', submission.id)

      if (error) throw error

      onDeleteSubmission(submission.id)
    } catch (error) {
      console.error('Error deleting submission:', error)
    } finally {
      setUpdating(false)
    }
  }

  const canMarkWinner = currentUser?.role === 'STREAMER' || currentUser?.role === 'ADMIN'
  const isStreamer = currentUser?.role === 'STREAMER'

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={() => handleStatusUpdate('APPROVED')}
        disabled={updating || submission.status === 'APPROVED'}
        className="bg-green-600 hover:bg-green-700 text-white"
        size="sm"
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Godkjenn
      </Button>

      <Button
        onClick={() => handleStatusUpdate('DENIED')}
        disabled={updating || submission.status === 'DENIED'}
        className="bg-red-600 hover:bg-red-700 text-white"
        size="sm"
      >
        <X className="h-4 w-4 mr-2" />
        Avslå
      </Button>

      {/* Only show winner button to STREAMER and ADMIN */}
      {canMarkWinner && (
        <Button
          onClick={() => handleStatusUpdate('WINNER')}
          disabled={updating || submission.status === 'WINNER'}
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
          size="sm"
        >
          <Trophy className="h-4 w-4 mr-2" />
          Marker som vinner
        </Button>
      )}

      <Button
        onClick={handleBanUser}
        disabled={updating}
        variant="destructive"
        size="sm"
      >
        <MinusCircle className="h-4 w-4 mr-2" />
        Utesteng bruker
      </Button>

      <Button
        onClick={handleDeleteSubmission}
        disabled={updating}
        variant="destructive"
        size="sm"
        className="bg-red-800 hover:bg-red-900"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Slett innsending
      </Button>

      {submission.status && (
        <Badge variant="secondary" className="ml-auto">
          Nåværende: {submission.status}
        </Badge>
      )}
    </div>
  )
}

