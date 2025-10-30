'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Submission, SubmissionStatus } from '@/types'
import VideoPlayer from '@/components/video/VideoPlayer'
import ModerationActions from '@/components/moderation/ModerationActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ChevronLeft, ChevronRight, Eye, Calendar, User, ExternalLink, MessageSquare, Trophy, Trash2, MinusCircle } from 'lucide-react'

interface ReviewInterfaceProps {
  contestId?: string
}

export default function ReviewInterface({ contestId }: ReviewInterfaceProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [contest, setContest] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchSubmissions()
    if (contestId) {
      fetchContest()
    }
  }, [contestId])

  const fetchContest = async () => {
    if (!contestId) return
    
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .eq('id', contestId)
        .single()

      if (error) {
        console.error('Error fetching contest:', error)
      } else {
        setContest(data)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('submissions')
        .select(`
          *,
          submitter:profiles(*)
        `)
        .eq('status', 'APPROVED')
        .order('created_at', { ascending: false })

      if (contestId) {
        query = query.eq('contest_id', contestId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching approved submissions:', error)
        setSubmissions([])
      } else {
        setSubmissions(data || [])
      }
      setCurrentIndex(0) // Reset to first submission when changing filters
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentSubmission = submissions[currentIndex]

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentIndex < submissions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleStatusChange = (submissionId: string, newStatus: SubmissionStatus) => {
    // Update the submission status in the database
    const updateSubmission = async () => {
      try {
        const { error } = await supabase
          .from('submissions')
          .update({ status: newStatus })
          .eq('id', submissionId)

        if (error) throw error

        // Update local state instead of refreshing entire list
        setSubmissions(prev => prev.map(sub => 
          sub.id === submissionId ? { ...sub, status: newStatus } : sub
        ))
      } catch (error) {
        console.error('Error updating submission:', error)
      }
    }

    updateSubmission()
  }

  const handleWinnerToggle = (submissionId: string) => {
    const currentSub = submissions.find(sub => sub.id === submissionId)
    if (!currentSub) return

    const newStatus = currentSub.status === 'WINNER' ? 'APPROVED' : 'WINNER'
    handleStatusChange(submissionId, newStatus)
  }

  const handleBanUser = (userId: string) => {
    const banUser = async () => {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ is_banned: true })
          .eq('id', userId)

        if (error) throw error

        // Remove submissions from banned user locally
        setSubmissions(prev => prev.filter(sub => sub.submitter_id !== userId))
        
        // Adjust current index if needed
        if (currentIndex >= submissions.length - 1) {
          setCurrentIndex(Math.max(0, submissions.length - 2))
        }
      } catch (error) {
        console.error('Error banning user:', error)
      }
    }

    banUser()
  }

  const handleDeleteSubmission = (submissionId: string) => {
    const deleteSubmission = async () => {
      try {
        const { error } = await supabase
          .from('submissions')
          .delete()
          .eq('id', submissionId)

        if (error) throw error

        // Remove deleted submission locally
        setSubmissions(prev => prev.filter(sub => sub.id !== submissionId))
        
        // Adjust current index if needed
        if (currentIndex >= submissions.length - 1) {
          setCurrentIndex(Math.max(0, submissions.length - 2))
        }
      } catch (error) {
        console.error('Error deleting submission:', error)
      }
    }

    deleteSubmission()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
        <p className="mt-6 text-lg text-slate-400">
          Laster inn godkjente videoer...
        </p>
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="border-slate-800 bg-slate-900/50 text-center py-16">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-slate-800 rounded-full">
                <Eye className="h-16 w-16 text-slate-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-4">Ingen godkjente videoer</h1>
                <p className="text-slate-400">
                  Det er ingen godkjente videoer å vurdere for øyeblikket.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Status filter removed: streamer sees only approved */}

        {/* Submission Info */}
        {currentSubmission && (
          <div className="mb-6 text-sm text-slate-300">
            <div className="flex items-center gap-4">
              <span>Innsending ID: {currentSubmission.id.substring(0, 8)}</span>
              <span className="text-green-400">Status: {currentSubmission.status}</span>
              <span>{currentIndex + 1} / {submissions.length}</span>
            </div>
          </div>
        )}

        {/* Main Video Player Area */}
        {currentSubmission && (
          <div className="space-y-4">
            {/* Video Player with External Navigation */}
            <div className="flex items-center gap-4">
              {/* Left Navigation Arrow */}
              <Button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                size="sm"
                className="h-12 w-12 p-0 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              {/* Video Player */}
              <div className={`flex-1 bg-black rounded-lg overflow-hidden ${currentSubmission.platform === 'TIKTOK' ? 'flex justify-center items-center' : ''}`}>
                <div className={currentSubmission.platform === 'TIKTOK' ? 'w-full max-w-[420px]' : ''}>
                  <VideoPlayer
                    videoId={currentSubmission.video_id}
                    platform={currentSubmission.platform}
                  />
                </div>
              </div>

              {/* Right Navigation Arrow */}
              <Button
                onClick={goToNext}
                disabled={currentIndex === submissions.length - 1}
                size="sm"
                className="h-12 w-12 p-0 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Submission Details - Centered */}
            <div className="text-center space-y-2">
              {/* Submitter */}
              <div>
                <p className="text-slate-400 text-sm">
                  {currentSubmission.submitter?.username}
                </p>
              </div>

              {/* Video Link */}
              <div>
                <a 
                  href={currentSubmission.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 break-all text-sm"
                >
                  {currentSubmission.video_url}
                </a>
              </div>

              {/* Removed timestamps display */}

              {/* Comment if exists */}
              {currentSubmission.metadata?.comment && (
                <div>
                  <p className="text-slate-300 text-sm">
                    {currentSubmission.metadata.comment}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 max-w-md mx-auto">
              {/* Winner Toggle Switch - Full Width */}
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                <div className="flex items-center gap-3">
                  <Trophy className={`h-5 w-5 ${currentSubmission.status === 'WINNER' ? 'text-yellow-500' : 'text-yellow-400/50'}`} />
                  <span className="text-white font-medium">
                    {currentSubmission.status === 'WINNER' ? 'VINNER' : 'MARKER SOM VINNER'}
                  </span>
                </div>
                <Switch
                  checked={currentSubmission.status === 'WINNER'}
                  onCheckedChange={() => handleWinnerToggle(currentSubmission.id)}
                  className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-slate-700"
                />
              </div>
              
              {/* Action Buttons Row */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  title="Slett denne innsendingen"
                  onClick={() => handleDeleteSubmission(currentSubmission.id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  FJERN
                </Button>
                
                <Button
                  title="Utesteng denne brukeren"
                  onClick={() => handleBanUser(currentSubmission.submitter_id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <MinusCircle className="h-4 w-4 mr-2" />
                  UTESTENG BRUKER
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}




