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
import { usePermissions } from '@/lib/permissions-client'
import { Button as UIButton } from '@/components/ui/button'
import { Trophy, CheckCircle, X, RotateCcw, Eye } from 'lucide-react'
import ModerationActions from '@/components/moderation/ModerationActions'
import Link from 'next/link'

interface ModerationDashboardProps {
  selectedContest: string | null
  allContests: any[]
}

export default function ModerationDashboard({ selectedContest, allContests }: ModerationDashboardProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [currentStatus, setCurrentStatus] = useState('UNAPPROVED')
  const supabase = createClient()
  const { isModerator } = usePermissions()
  const [canCopyIds, setCanCopyIds] = useState(false)

  useEffect(() => {
    fetchSubmissions()
    // Check copy permission (mods/streamers/admins)
    isModerator().then(setCanCopyIds).catch(() => setCanCopyIds(false))
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

  const handleStatusChange = (submissionId: string, newStatus: any) => {
    // Optimistically update without refetching or jumping scroll
    setSubmissions(prev => {
      const index = prev.findIndex(sub => sub.id === submissionId)
      if (index === -1) return prev
      // If the new status no longer matches the active filter, remove it locally
      if (newStatus !== currentStatus) {
        return prev.filter(sub => sub.id !== submissionId)
      }
      const updated = [...prev]
      updated[index] = { ...updated[index], status: newStatus }
      return updated
    })
  }

  const handleBanUser = () => {
    // No refetch; leave current list as-is. Separate actions will remove items.
  }

  const handleDeleteSubmission = (submissionId: string) => {
    // Update local state to remove deleted submission
    setSubmissions(prev => prev.filter(sub => sub.id !== submissionId))
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

  // Show contest selection UI if no contest is selected
  if (!selectedContest || selectedContest === 'all') {
    return (
      <div className="space-y-6">
        <div className="pb-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-white">Vurder innsendinger</h3>
              <p className="text-sm text-slate-400 mt-1">Velg en konkurranse for å fortsette</p>
            </div>
          </div>
        </div>

        <Card className="border-slate-800 bg-slate-900/50 text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <Trophy className="h-16 w-16 text-slate-400" />
              <h3 className="text-xl font-bold text-white">Velg en konkurranse</h3>
              <p className="text-slate-400">Du må velge en spesifikk konkurranse for å kunne vurdere innsendinger</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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
          <div className="flex items-center gap-3">
            {currentStatus === 'WINNER' && canCopyIds && submissions.length > 0 && (
              <UIButton
                onClick={() => {
                  // Build CSV with headers (only id, platform, submitter, video_url)
                  const rows = submissions.map(s => ({
                    id: s.id,
                    platform: s.platform,
                    submitter: (s as any).submitter?.username || '',
                    video_url: s.video_url
                  }))
                  const headers = ['id','platform','submitter','video_url']
                  const escape = (v: any) => {
                    const str = String(v ?? '')
                    if (/[",\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"'
                    return str
                  }
                  const content = [headers.join(','), ...rows.map(r => headers.map(h => escape((r as any)[h])).join(','))].join('\n')
                  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `winners${selectedContest && selectedContest !== 'all' ? `-${String(selectedContest).substring(0,8)}` : ''}.csv`
                  document.body.appendChild(a)
                  a.click()
                  a.remove()
                  URL.revokeObjectURL(url)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Eksporter CSV
              </UIButton>
            )}
            {selectedContestInfo && selectedContest !== 'all' && (
              <Badge className="bg-blue-600 text-white">
                {selectedContestInfo.title}
              </Badge>
            )}
          </div>
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
                    />
                  </div>

                  {/* Submission Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                      <p className="text-sm text-slate-400">{submission.video_url}</p>
                      </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(submission.status)} text-white font-bold`}>
                        {submission.status}
                      </Badge>
                    </div>
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

                    <div className="mt-4 text-sm text-slate-500 mb-4">
                      Sendt inn: {new Date(submission.created_at).toLocaleDateString()}
                    </div>

                    {/* Moderation Actions */}
                    <div className="mt-6 pt-4 border-t border-slate-700">
                      <div className="flex flex-wrap gap-3 mb-4">
                        {submission.status === 'APPROVED' && selectedContest && selectedContest !== 'all' && (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="border-blue-600 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                          >
                            <Link href={`/review/${selectedContest}`} className="flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Gå til vurdering
                            </Link>
                          </Button>
                        )}
                      </div>
                      <ModerationActions
                        submission={submission}
                        onStatusChange={handleStatusChange}
                        onBanUser={handleBanUser}
                        onDeleteSubmission={handleDeleteSubmission}
                      />
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


