'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Contest } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { Calendar, Eye } from 'lucide-react'
import SubmissionModal from '@/components/contests/SubmissionModal'
import Link from 'next/link'
import { useUser } from '@/providers/UserProvider'

const TwitchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path 
      d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm16.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h15.714Z"
      fill="white"
      stroke="white"
      strokeWidth="1"
    />
  </svg>
)

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loadingContests, setLoadingContests] = useState(true)
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null)
  const { user, profile } = useUser()
  const supabase = useMemo(() => createClient(), [])

  const handleConnect = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'twitch',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) console.error('Error signing in:', error)
  }

  const fetchContests = useCallback(async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    try {
      setLoadingContests(true)

      const response = await fetch('/api/contests', {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`Failed to load contests (${response.status})`)
      }

      const { contests: contestsData = [] }: { contests: Contest[] } = await response.json()

      if (!contestsData || contestsData.length === 0) {
        setContests([])
        setLoadingContests(false)
        return
      }

      const sortContests = (items: Contest[]) =>
        [...items].sort((a, b) => {
          if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1
          if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })

      setContests(sortContests(contestsData))
      setLoadingContests(false)
    } catch (error) {
      if ((error as DOMException).name === 'AbortError') {
        console.warn('Contests request timed out')
      } else {
        console.error('Error fetching contests:', error)
      }
      setContests([])
      setLoadingContests(false)
    } finally {
      clearTimeout(timeoutId)
    }
  }, [])

  const handleSubmitSuccess = () => {
    fetchContests()
  }

  useEffect(() => {
    fetchContests()
  }, [fetchContests])

  if (loadingContests) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
        <p className="mt-6 text-lg text-gray-400">
          Loading contests...
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-[1100px] mx-auto px-10 py-6">
      {/* Header Section */}
      <Card className="bg-slate-800/50 border border-blue-500/20 text-center mb-6 rounded-lg">
        <CardContent className="px-4">
          {/* Avatar */}
          <div className="inline-block mb-0 mt-5">
            <img 
              src="https://cdn.7tv.app/emote/01K2FVET0YSST6DY9519CP8YX6/4x.avif"
              alt="Skiben logo"
              className="w-[150px] h-[150px] object-contain"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>

          {/* Title */}
          <h2 className="font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-2 text-2xl md:text-3xl">
            SKIBEN Konkurranser
          </h2>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {/* Connect Button */}
            {!user ? (
              <Button
                size="sm"
                onClick={handleConnect}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-2 text-sm font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
              >
                <TwitchIcon />
                Koble til
              </Button>
            ) : null}

            {/* Review Button for Streamers */}
            {user && profile?.role === 'STREAMER' && (
              <Button
                asChild
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-2 text-sm font-bold uppercase tracking-wider rounded-lg shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40"
              >
                <Link href="/review">
                  <Eye className="h-4 w-4 mr-2" />
                  Vurder innsendinger
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contests List */}
      <div className="flex flex-col gap-4">
        {contests.length === 0 ? (
          <Card className="bg-slate-800/50 border border-blue-500/20 text-center py-8 text-white rounded-lg">
            <CardContent>
              <div className="text-7xl mb-2 opacity-50">🎯</div>
              <h3 className="font-semibold text-xl mb-2 text-white">
                Ingen konkurranser funnet
              </h3>
              <p className="text-gray-300">
                Sjekk innom snart for nye konkurranser!
              </p>
            </CardContent>
          </Card>
        ) : (
          contests.map((contest) => (
            <Card 
              key={contest.id} 
              className={`bg-[rgba(26,26,46,${contest.status === 'ACTIVE' ? '0.4' : '0.2'})] border border-blue-500/20 text-white rounded-lg overflow-hidden transition-all duration-200 ${
                contest.status === 'ACTIVE' 
                  ? 'opacity-100 hover:bg-[rgba(26,26,46,0.6)] hover:border-blue-500/40 hover:-translate-y-0.5 hover:shadow-lg' 
                  : 'opacity-60 hover:bg-[rgba(26,26,46,0.35)]'
              }`}
            >
              <div className="flex justify-between p-3 items-center gap-3">
                {/* Left side - Text content */}
                <div className="flex-1">
                  {/* Status and Date */}
                  <div className="mb-2">
                    <p className="text-gray-400 text-xs">
                      Status: <span className={`font-bold text-xs ${
                        contest.status === 'ACTIVE' ? 'text-red-500' : 'text-slate-500'
                      }`}>
                        {contest.status === 'ACTIVE' ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </p>
                    <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(contest.created_at).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Tags */}
                  {Array.isArray(contest.tags) && contest.tags.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {contest.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-blue-600/10 text-blue-400 border-blue-600/30 font-semibold">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Main title */}
                  <h3 className="text-white font-bold mb-2 text-2xl leading-tight uppercase tracking-wide">
                    {contest.title}
                  </h3>

                  {/* Description */}
                  {contest.description && (
                    <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                      {contest.description}
                    </p>
                  )}

                  {/* Submissions count */}
                  <p className="text-blue-600 font-bold text-base uppercase tracking-wider">
                    {contest.submission_count} INNSENDINGER
                  </p>
                </div>

                {/* Right side - Submit button */}
                {contest.status === 'ACTIVE' && (
                  <div>
                    <Button
                      size="sm"
                      onClick={() => setSelectedContest(contest)}
                      className="bg-blue-600 text-white px-4 py-2 min-w-[80px] font-bold uppercase tracking-wider text-xs rounded-lg hover:bg-blue-700 hover:shadow-md"
                    >
                      SEND INN
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Submission Modal */}
      {selectedContest && (
        <SubmissionModal
          user={user}
          key={selectedContest.id}
          contest={selectedContest}
          onClose={() => setSelectedContest(null)}
          onSubmitSuccess={handleSubmitSuccess}
        />
      )}
    </div>
  )
}
