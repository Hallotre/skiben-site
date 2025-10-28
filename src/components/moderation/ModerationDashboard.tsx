'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Submission } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import VideoPlayer from '@/components/video/VideoPlayer'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Trophy } from 'lucide-react'

interface ModerationDashboardProps {
  selectedContest: string | null
  allContests: any[]
}

export default function ModerationDashboard({ selectedContest, allContests }: ModerationDashboardProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStatus, setCurrentStatus] = useState('UNAPPROVED')
  const supabase = createClient()

  useEffect(() => {
    fetchSubmissions()
  }, [selectedContest, currentStatus])

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('submissions')
        .select(`
          *,
          submitter:profiles(*)
        `)
        .eq('status', currentStatus)

      if (selectedContest && selectedContest !== 'all') {
        query = query.eq('contest_id', selectedContest)
      }

      const { data } = await query.order('created_at', { ascending: false })

      setSubmissions(data || [])
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-600'
      case 'DENIED': return 'bg-red-600'
      case 'WINNER': return 'bg-yellow-600'
      case 'UNAPPROVED': return 'bg-yellow-600'
      default: return 'bg-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
        <p className="mt-6 text-lg text-slate-400">Laster inn innsendinger...</p>
      </div>
    )
  }

  const selectedContestInfo = allContests.find(c => c.id === selectedContest)

  return (
    <div className="space-y-6">
      {/* Status Filter Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white">Vurder innsendinger</h3>
            {selectedContestInfo && selectedContest !== 'all' && (
              <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                <Trophy className="h-3 w-3" />
                Konkurranse: {selectedContestInfo.title}
              </p>
            )}
            {(!selectedContest || selectedContest === 'all') && (
              <p className="text-sm text-slate-400 mt-1">Alle konkurranser</p>
            )}
          </div>
          {selectedContestInfo && selectedContest !== 'all' && (
            <Badge className="bg-blue-600 text-white">
              {selectedContestInfo.title}
            </Badge>
          )}
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
            {(['UNAPPROVED', 'APPROVED', 'DENIED', 'WINNER'] as const).map(status => (
          <Button
            key={status}
            variant={currentStatus === status ? 'default' : 'outline'}
            onClick={() => setCurrentStatus(status)}
            className={currentStatus === status 
              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white' 
              : 'border-slate-700 bg-slate-900/30 text-white hover:bg-slate-700 hover:border-slate-600 hover:text-white'
            }
          >
                {status === 'UNAPPROVED' && 'VENTENDE'}
                {status === 'APPROVED' && 'GODKJENT'}
                {status === 'DENIED' && 'AVSLÅTT'}
                {status === 'WINNER' && 'VINNER'}
          </Button>
        ))}
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/50 text-center py-12">
          <CardContent>
            <p className="text-slate-400">Ingen {currentStatus === 'UNAPPROVED' ? 'ventende' : currentStatus === 'APPROVED' ? 'godkjente' : currentStatus === 'DENIED' ? 'avslåtte' : 'vinner'} innsendinger funnet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {submissions.map((submission) => (
            <Card key={submission.id} className="border-slate-800 bg-slate-900/50 hover:border-blue-600/50 transition-all">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Video Player */}
                  <div className="flex-shrink-0 w-80">
                    <VideoPlayer
                      videoId={submission.video_id}
                      platform={submission.platform}
                      title={submission.title}
                    />
                  </div>

                  {/* Submission Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{submission.title}</h3>
                        <p className="text-sm text-slate-400">{submission.video_url}</p>
                      </div>
                      <Badge className={`${getStatusColor(submission.status)} text-white font-bold`}>
                        {submission.status}
                      </Badge>
                    </div>

                    {submission.submitter && (
                      <div className="flex items-center gap-2 mb-4">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-slate-800 text-white">
                            {submission.submitter.username?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-slate-400">{submission.submitter.username}</span>
                      </div>
                    )}

                    {submission.submission_comment && (
                      <p className="text-slate-400 mb-4">{submission.submission_comment}</p>
                    )}

                    <div className="mt-4 text-sm text-slate-500">
                      Sendt inn: {new Date(submission.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


