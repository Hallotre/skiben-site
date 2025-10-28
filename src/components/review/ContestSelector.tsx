'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Contest } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Trophy, Eye, Calendar, Users } from 'lucide-react'
import Link from 'next/link'

export default function ContestSelector() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchContests()
  }, [])

  const fetchContests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching contests:', error)
        setContests([])
      } else {
        setContests(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
        <p className="mt-6 text-lg text-slate-400">
          Laster inn aktive konkurranser...
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Eye className="h-8 w-8 text-blue-500" />
          Velg konkurranse å vurdere
        </h1>
        <p className="text-slate-400">
          Velg en aktiv konkurranse for å begynne å vurdere innsendinger
        </p>
      </div>

      {/* Contests List */}
      {contests.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/50 text-center py-16">
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-slate-800 rounded-full">
                <Trophy className="h-16 w-16 text-slate-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Ingen aktive konkurranser</h3>
                <p className="text-slate-400">
                  Det er ingen aktive konkurranser å vurdere for øyeblikket.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contests.map((contest) => (
            <Card
              key={contest.id}
              className="group border-slate-800 bg-slate-900/50 hover:border-blue-600/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className="bg-green-600 hover:bg-green-700">
                    AKTIV
                  </Badge>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(contest.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {contest.tags && contest.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-blue-600/10 text-blue-400 border-blue-600/30 font-semibold"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>

              <CardContent>
                <h3 className="font-bold text-xl mb-3 text-white transition-colors">
                  {contest.title}
                </h3>
                <p className="text-sm text-slate-400 mb-4 min-h-[48px] line-clamp-3">
                  {contest.description || 'Ingen beskrivelse'}
                </p>

                <div className="flex items-center gap-2 p-3 bg-blue-600/10 rounded-lg mb-4 border border-blue-600/20">
                  <Users className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-bold text-blue-400">
                      {contest.submission_count} INNSENDINGER
                    </p>
                  </div>
                </div>

                <Button
                  asChild
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Link href={`/review/${contest.id}`} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Vurder innsendinger
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
