'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Submission } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Copy, CheckCircle2, Trophy } from 'lucide-react'

interface WinnersTabProps {
  contestId?: string | null
  selectedContest?: string | null
  allContests?: any[]
}

export default function WinnersTab({ contestId, selectedContest, allContests }: WinnersTabProps) {
  const [winners, setWinners] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchWinners()
  }, [contestId])

  const fetchWinners = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('submissions')
        .select('*')
        .eq('status', 'WINNER')
        .order('created_at', { ascending: false })

      if (contestId) {
        query = query.eq('contest_id', contestId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching winners:', error)
        setWinners([])
      } else {
        setWinners(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
        <p className="mt-6 text-lg text-slate-400">Laster inn vinnere...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold mb-2 flex items-center gap-2">
          <Trophy className="h-8 w-8 text-white" />
          <span className="text-white">Vinnere</span>
        </h2>
        <p className="text-slate-400 font-medium">
          Vis og administrer vinner-innsendinger
        </p>
      </div>

      {winners.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/50 text-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Trophy className="h-16 w-16 text-slate-400" />
            <p className="text-slate-400">Ingen vinnere enda</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {winners.map((winner) => (
            <Card key={winner.id} className="border-slate-800 bg-slate-900/50 hover:border-blue-600 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-yellow-600 text-white font-bold border-0">
                    VINNER
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(winner.id)}
                    className="h-8 w-8 p-0"
                  >
                    {copiedId === winner.id ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <h3 className="font-bold text-lg mb-2 text-white">{winner.title}</h3>
                <p className="text-sm text-slate-400 mb-3">
                  {winner.submission_comment}
                </p>
                
                <div className="text-xs text-slate-500">
                  ID: {winner.id.substring(0, 8)}...
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
